import * as XLSX from 'xlsx';

export interface ExportColumn {
    key: string;
    header: string;
}

export interface ExportOptions {
    fileName?: string;
    sheetName?: string;
    columns?: ExportColumn[];
    title?: string;
    summary?: Array<{ label: string; value: string }>;
}

type Worksheet = XLSX.WorkSheet;

const EXCEL_THEME = {
    primaryFill: 'F97316',
    primaryText: 'FFFFFF',
    lightFill: 'FFF7ED',
    border: 'FDBA74',
};

function applyCellStyle(
    worksheet: Worksheet,
    address: string,
    style: Record<string, unknown>,
): void {
    const cell = worksheet[address];

    if (!cell) {
        return;
    }

    cell.s = {
        ...(cell.s ?? {}),
        ...style,
    };
}

function setRowStyles(
    worksheet: Worksheet,
    rowNumber: number,
    columnCount: number,
    style: Record<string, unknown>,
): void {
    for (let col = 0; col < columnCount; col += 1) {
        const address = XLSX.utils.encode_cell({ r: rowNumber - 1, c: col });
        applyCellStyle(worksheet, address, style);
    }
}

function applyReportLayout(
    worksheet: Worksheet,
    headers: string[],
    title: string | undefined,
    summary: Array<{ label: string; value: string }>,
): void {
    const infoRows = (title ? 1 : 0) + 1 + summary.length + 1;
    const headerRow = infoRows + 1;

    worksheet['!cols'] = headers.map((header) => ({
        wch: Math.min(Math.max(header.length + 8, 16), 34),
    }));

    worksheet['!autofilter'] = {
        ref: `A${headerRow}:${XLSX.utils.encode_col(headers.length - 1)}${headerRow}`,
    };

    if (headers.length > 0) {
        worksheet['!freeze'] = { xSplit: 0, ySplit: headerRow };
    }

    if (title) {
        applyCellStyle(worksheet, 'A1', {
            font: { bold: true, sz: 14, color: { rgb: EXCEL_THEME.primaryText } },
            fill: { fgColor: { rgb: EXCEL_THEME.primaryFill } },
            alignment: { vertical: 'center', horizontal: 'left' },
        });
    }

    setRowStyles(worksheet, headerRow, headers.length, {
        font: { bold: true, color: { rgb: EXCEL_THEME.primaryText } },
        fill: { fgColor: { rgb: EXCEL_THEME.primaryFill } },
        border: {
            top: { style: 'thin', color: { rgb: EXCEL_THEME.border } },
            bottom: { style: 'thin', color: { rgb: EXCEL_THEME.border } },
            left: { style: 'thin', color: { rgb: EXCEL_THEME.border } },
            right: { style: 'thin', color: { rgb: EXCEL_THEME.border } },
        },
        alignment: { vertical: 'center' },
    });

    const firstDataRow = headerRow + 1;
    const range = XLSX.utils.decode_range(worksheet['!ref'] ?? `A1:A${firstDataRow}`);

    for (let row = firstDataRow; row <= range.e.r + 1; row += 1) {
        const isAlternate = (row - firstDataRow) % 2 === 1;

        if (isAlternate) {
            setRowStyles(worksheet, row, headers.length, {
                fill: { fgColor: { rgb: EXCEL_THEME.lightFill } },
            });
        }
    }
}

export function exportToExcel<T extends Record<string, unknown>>(
    data: T[],
    options: ExportOptions = {},
): void {
    const {
        fileName = 'export',
        sheetName = 'Dados',
        title,
        summary = [],
    } = options;

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    if (title || summary.length > 0) {
        const headerRows: (string | number)[][] = [];

        if (title) {
            headerRows.push([title]);
        }

        headerRows.push([
            `Gerado em: ${new Intl.DateTimeFormat('pt-BR').format(new Date())}`,
        ]);
        summary.forEach((item) => headerRows.push([`${item.label}: ${item.value}`]));
        headerRows.push([]);
        XLSX.utils.sheet_add_aoa(worksheet, headerRows, { origin: 'A1' });
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    XLSX.writeFile(workbook, `${fileName}.xlsx`, { cellStyles: true });
}

export function exportToExcelWithColumns<T extends Record<string, unknown>>(
    data: T[],
    columns: ExportColumn[],
    options: ExportOptions = {},
): void {
    const {
        fileName = 'export',
        sheetName = 'Dados',
        title,
        summary = [],
    } = options;

    const workbook = XLSX.utils.book_new();

    const headers = columns.map((col) => col.header);
    const dataRows = data.map((row) =>
        columns.map((col) => {
            const value = row[col.key];

            if (value === null || value === undefined) {
                return '';
            }

            if (typeof value === 'object') {
                return JSON.stringify(value);
            }

            return value;
        }),
    );

    const topRows: (string | number)[][] = [];

    if (title) {
        topRows.push([title]);
    }

    topRows.push([`Gerado em: ${new Intl.DateTimeFormat('pt-BR').format(new Date())}`]);
    summary.forEach((item) => topRows.push([`${item.label}: ${item.value}`]));
    topRows.push([]);

    const worksheet = XLSX.utils.aoa_to_sheet([...topRows, headers, ...dataRows]);

    applyReportLayout(worksheet, headers, title, summary);

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`, { cellStyles: true });
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export function formatDate(value: string | Date): string {
    const date = typeof value === 'string' ? new Date(value) : value;

    return new Intl.DateTimeFormat('pt-BR').format(date);
}

export function formatPercentage(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
}
