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

    doc.setFontSize(16);
    doc.text(title, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${formatDate(new Date())}`, 14, 30);

    let startY = 35;

    if (summary.length > 0) {
        summary.forEach((item, index) => {
            doc.text(`${item.label}: ${item.value}`, 14, 36 + index * 5);
        });
        startY = 40 + summary.length * 5;
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
            fillColor: [51, 51, 51],
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold',
        },
        bodyStyles: {
            fontSize: 9,
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
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

    doc.setFontSize(16);
    doc.text(title, 14, 22);

    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 30,
        theme: 'striped',
        headStyles: {
            fillColor: [51, 51, 51],
            textColor: 255,
            fontSize: 10,
        },
        bodyStyles: {
            fontSize: 9,
        },
    });

    doc.save(`${fileName}.pdf`);
}
