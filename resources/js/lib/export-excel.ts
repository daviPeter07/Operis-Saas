import * as XLSX from 'xlsx';

export interface ExportColumn {
    key: string;
    header: string;
}

export interface ExportOptions {
    fileName?: string;
    sheetName?: string;
    columns?: ExportColumn[];
}

export function exportToExcel<T extends Record<string, unknown>>(
    data: T[],
    options: ExportOptions = {},
): void {
    const { fileName = 'export', sheetName = 'Dados' } = options;

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export function exportToExcelWithColumns<T extends Record<string, unknown>>(
    data: T[],
    columns: ExportColumn[],
    options: ExportOptions = {},
): void {
    const { fileName = 'export', sheetName = 'Dados' } = options;

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

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
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
