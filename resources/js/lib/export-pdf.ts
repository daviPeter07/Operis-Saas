import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate, formatPercentage } from './export-excel';

export interface PDFColumn {
    key: string;
    header: string;
    format?: 'currency' | 'date' | 'percentage' | 'number';
}

export interface ExportPDFOptions {
    fileName?: string;
    title?: string;
    orientation?: 'portrait' | 'landscape';
    summary?: Array<{ label: string; value: string }>;
}

export function exportToPDF<T extends Record<string, unknown>>(
    data: T[],
    columns: PDFColumn[],
    options: ExportPDFOptions = {},
): void {
    const {
        fileName = 'export',
        title = 'Relatório',
        orientation = 'portrait',
        summary = [],
    } = options;

    const doc = new jsPDF({ orientation });
    const primaryColor: [number, number, number] = [249, 115, 22];
    const primaryDark: [number, number, number] = [194, 65, 12];
    const softBg: [number, number, number] = [255, 247, 237];

    doc.setFontSize(16);
    doc.setTextColor(...primaryDark);
    doc.text(title, 14, 20);

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.8);
    doc.line(14, 23, doc.internal.pageSize.getWidth() - 14, 23);

    doc.setFontSize(10);
    doc.setTextColor(90);
    doc.text(`Gerado em: ${formatDate(new Date())}`, 14, 30);

    let startY = 35;

    if (summary.length > 0) {
        const lineHeight = 6;
        const summaryTop = 34;
        const summaryHeight = summary.length * lineHeight + 6;

        doc.setFillColor(...softBg);
        doc.roundedRect(
            14,
            summaryTop,
            doc.internal.pageSize.getWidth() - 28,
            summaryHeight,
            2,
            2,
            'F',
        );

        summary.forEach((item, index) => {
            const y = summaryTop + 6 + index * lineHeight;
            doc.setTextColor(...primaryDark);
            doc.text(`${item.label}:`, 18, y);
            doc.setTextColor(60);
            doc.text(item.value, 68, y);
        });

        startY = summaryTop + summaryHeight + 6;
    }

    const tableData = data.map((row) =>
        columns.map((col) => {
            const value = row[col.key];

            if (value === null || value === undefined) {
                return '-';
            }

            switch (col.format) {
                case 'currency':
                    return formatCurrency(value as number);
                case 'date':
                    return formatDate(value as string);
                case 'percentage':
                    return formatPercentage(value as number);
                case 'number':
                    return Number(value).toLocaleString('pt-BR');
                default:
                    if (typeof value === 'object') {
                        return JSON.stringify(value);
                    }

                    return String(value);
            }
        }),
    );

    autoTable(doc, {
        head: [columns.map((col) => col.header)],
        body: tableData,
        startY,
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor,
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold',
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [45, 45, 45],
            lineColor: [253, 186, 116],
            lineWidth: 0.1,
        },
        alternateRowStyles: {
            fillColor: softBg,
        },
        styles: {
            cellPadding: 2.2,
        },
        margin: { top: 10, right: 14, bottom: 20, left: 14 },
    });

    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.getWidth() - 25,
            doc.internal.pageSize.getHeight() - 10,
        );
    }

    doc.save(`${fileName}.pdf`);
}

export function exportSimplePDF(
    headers: string[],
    rows: string[][],
    options: ExportPDFOptions = {},
): void {
    const {
        fileName = 'export',
        title = 'Relatório',
        orientation = 'portrait',
    } = options;

    const doc = new jsPDF({ orientation });
    const primaryColor: [number, number, number] = [249, 115, 22];
    const softBg: [number, number, number] = [255, 247, 237];

    doc.setFontSize(16);
    doc.setTextColor(194, 65, 12);
    doc.text(title, 14, 22);

    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 30,
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor,
            textColor: 255,
            fontSize: 10,
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [45, 45, 45],
            lineColor: [253, 186, 116],
            lineWidth: 0.1,
        },
        alternateRowStyles: {
            fillColor: softBg,
        },
    });

    doc.save(`${fileName}.pdf`);
}
