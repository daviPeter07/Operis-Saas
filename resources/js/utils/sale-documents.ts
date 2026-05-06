import { jsPDF } from 'jspdf';
import {
    formatCurrencyBR,
    formatDateBR,
    translatePaymentMethod,
    translateStatus,
} from '@/lib/format';
import type { Sale } from '@/schemas/sale';

function resolveCustomerName(sale: Sale): string {
    return sale.customer_name?.trim() || `Cliente #${sale.customer_id}`;
}

function renderInstallmentSummary(sale: Sale): string | null {
    if ((sale.installments ?? 1) <= 1) {
        return null;
    }

    const amount = formatCurrencyBR(Number(sale.installment_value ?? sale.total));
    const firstDate = sale.first_installment_date
        ? formatDateBR(sale.first_installment_date)
        : formatDateBR(sale.date);

    return `${sale.installments}x de ${amount} - primeira parcela em ${firstDate}`;
}

function resolveProductLabel(item: NonNullable<Sale['items']>[number]): string {
    return item.product_name?.trim() || `Produto #${item.product_id}`;
}

function resolveCategorySummary(sale: Sale): string {
    const categories = Array.from(
        new Set(
            (sale.items ?? [])
                .map((item) => item.category_name?.trim())
                .filter((value): value is string => Boolean(value)),
        ),
    );

    return categories.join(', ') || '-';
}

export function downloadSaleInvoicePdf(sale: Sale): void {
    const document = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });
    const customerName = resolveCustomerName(sale);
    const installmentSummary = renderInstallmentSummary(sale);
    const items = sale.items ?? [];
    const translatedStatus = translateStatus(sale.status);

    document.setFillColor(244, 244, 245);
    document.rect(0, 0, 210, 34, 'F');
    document.setFont('helvetica', 'bold');
    document.setFontSize(18);
    document.setTextColor(24, 24, 27);
    document.text('Resumo da venda', 16, 14);
    document.setFontSize(11);
    document.setFont('helvetica', 'normal');
    document.setTextColor(113, 113, 122);
    document.text(`Emitido em ${formatDateBR(sale.date)} - Venda #${sale.id}`, 16, 24);

    document.setTextColor(17, 24, 39);
    document.setDrawColor(229, 231, 235);
    document.roundedRect(16, 44, 84, 34, 3, 3);
    document.roundedRect(110, 44, 84, 34, 3, 3);
    document.setFont('helvetica', 'bold');
    document.setFontSize(9);
    document.text('Cliente', 20, 53);
    document.text('Data da venda', 114, 53);
    document.setFontSize(10);
    document.setFont('helvetica', 'normal');
    document.text(customerName, 20, 62);
    document.text(formatDateBR(sale.date), 114, 62);
    document.setFont('helvetica', 'bold');
    document.setFontSize(9);
    document.text('Valor total', 20, 71);
    document.text('Situacao', 114, 71);
    document.setFontSize(12);
    document.text(formatCurrencyBR(sale.total), 20, 77);
    document.text(translatedStatus, 114, 77);

    let y = 92;

    document.setFont('helvetica', 'bold');
    document.setFontSize(12);
    document.text('Produtos', 16, y);
    y += 7;
    document.setFont('helvetica', 'normal');
    document.setFontSize(10);

    if (items.length === 0) {
        document.text('Nenhum item encontrado para esta venda.', 16, y);
        y += 8;
    } else {
        items.forEach((item) => {
            const productLabel = resolveProductLabel(item);
            document.setFont('helvetica', 'bold');
            document.text(productLabel, 16, y);
            document.setFont('helvetica', 'normal');
            y += 6;
            document.text(
                `${item.quantity}x - ${formatCurrencyBR(item.unit_price)} cada`,
                16,
                y,
            );
            document.setFont('helvetica', 'bold');
            document.text(formatCurrencyBR(item.subtotal), 176, y, { align: 'right' });
            document.setFont('helvetica', 'normal');
            y += 9;
        });
    }

    document.setFont('helvetica', 'bold');
    document.setFontSize(12);
    document.text('Pagamento', 16, y + 4);
    y += 12;
    document.setFont('helvetica', 'normal');
    document.setFontSize(10);
    document.text(translatePaymentMethod(sale.payment_method), 16, y);
    document.text(sale.status === 'pending' ? 'Pendente' : 'Liquidado', 176, y, {
        align: 'right',
    });
    y += 7;

    if (installmentSummary) {
        document.text(installmentSummary, 16, y);
        y += 7;
    }

    document.text(`Categorias: ${resolveCategorySummary(sale)}`, 16, y);
    y += 10;

    document.setFillColor(249, 250, 251);
    document.rect(0, y, 210, 40, 'F');
    y += 10;

    document.setFont('helvetica', 'bold');
    document.setFontSize(12);
    document.text('Valor original', 16, y);
    document.text(formatCurrencyBR(sale.subtotal), 176, y, { align: 'right' });
    y += 8;
    document.text('Desconto', 16, y);
    document.text(formatCurrencyBR(0), 176, y, { align: 'right' });
    y += 8;
    document.text('Valor final', 16, y);
    document.text(formatCurrencyBR(sale.total), 176, y, { align: 'right' });
    y += 8;
    document.text('Valor pago', 16, y);
    document.text(
        formatCurrencyBR(sale.status === 'completed' ? sale.total : 0),
        176,
        y,
        { align: 'right' },
    );
    y += 8;
    document.text('Valor restante', 16, y);
    document.text(
        formatCurrencyBR(sale.status === 'completed' ? 0 : sale.total),
        176,
        y,
        { align: 'right' },
    );
    y += 18;

    document.setFont('helvetica', 'normal');
    document.setFontSize(10);
    document.text('Chave Pix para pagamento', 176, y, { align: 'right' });
    y += 7;
    document.setFont('helvetica', 'bold');
    document.text('Telefone: (92) 99114-0294', 176, y, { align: 'right' });

    document.save(`fatura-venda-${sale.id}.pdf`);
}

export function printSaleThermalReceipt(sale: Sale): void {
    const receiptWindow = window.open('', '_blank', 'width=420,height=760');

    if (!receiptWindow) {
        return;
    }

    const customerName = resolveCustomerName(sale);
    const installmentSummary = renderInstallmentSummary(sale);
    const translatedStatus = translateStatus(sale.status);
    const itemsMarkup = (sale.items ?? [])
        .map(
            (item) => `
                <div class="line-item">
                    <div class="line-item__name">${resolveProductLabel(item)}</div>
                    <div class="line-item__meta">${item.quantity}x ${formatCurrencyBR(item.unit_price)}</div>
                    <div class="line-item__total">${formatCurrencyBR(item.subtotal)}</div>
                </div>
            `,
        )
        .join('');

    receiptWindow.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
            <head>
                <meta charset="utf-8" />
                <title>Comprovante</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 16px;
                        color: #111827;
                    }
                    .receipt {
                        width: 80mm;
                        margin: 0 auto;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 1px dashed #9ca3af;
                        padding-bottom: 12px;
                        margin-bottom: 12px;
                    }
                    .header h1 {
                        font-size: 24px;
                        margin: 0 0 6px;
                        font-family: "Courier New", monospace;
                    }
                    .muted {
                        font-size: 12px;
                        color: #4b5563;
                        font-family: "Courier New", monospace;
                    }
                    .section {
                        margin-bottom: 12px;
                        font-family: "Courier New", monospace;
                    }
                    .section-title {
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: .06em;
                        color: #6b7280;
                        margin-bottom: 6px;
                        font-family: "Courier New", monospace;
                    }
                    .line-item {
                        border-bottom: 1px dashed #e5e7eb;
                        padding: 8px 0;
                        font-family: "Courier New", monospace;
                    }
                    .line-item__name {
                        font-size: 13px;
                        font-weight: 700;
                    }
                    .line-item__meta,
                    .line-item__total {
                        font-size: 12px;
                    }
                    .totals {
                        border-top: 1px dashed #9ca3af;
                        padding-top: 10px;
                        margin-top: 12px;
                        font-size: 13px;
                        font-family: "Courier New", monospace;
                    }
                    .totals strong {
                        display: block;
                        margin-top: 4px;
                        font-size: 15px;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <main class="receipt">
                    <section class="header">
                        <div class="muted">================================</div>
                        <h1>COMPROVANTE DE VENDA</h1>
                        <div class="muted">Data: ${formatDateBR(sale.date)}</div>
                        <div class="muted">Venda: #${sale.id}</div>
                        <div class="muted">Cliente: ${customerName}</div>
                    </section>

                    <section class="section">
                        <div class="section-title">Produtos</div>
                        ${itemsMarkup || '<div class="muted">Nenhum item encontrado.</div>'}
                    </section>

                    <section class="section">
                        <div class="section-title">Pagamento</div>
                        <div>${translatePaymentMethod(sale.payment_method)}</div>
                        <div class="muted">Status: ${translatedStatus}</div>
                        ${installmentSummary ? `<div class="muted">${installmentSummary}</div>` : ''}
                        <div class="muted">Pendente - ${sale.first_installment_date ? formatDateBR(sale.first_installment_date) : formatDateBR(sale.date)}</div>
                    </section>

                    <section class="totals">
                        <div>Subtotal: ${formatCurrencyBR(sale.subtotal)}</div>
                        <strong>Total: ${formatCurrencyBR(sale.total)}</strong>
                        <div>Pago: ${formatCurrencyBR(sale.status === 'completed' ? sale.total : 0)}</div>
                        <div>Restante: ${formatCurrencyBR(sale.status === 'completed' ? 0 : sale.total)}</div>
                        <div style="margin-top: 12px; text-align:center; font-weight:700;">STATUS: ${translatedStatus.toUpperCase()}</div>
                    </section>
                    <section class="header" style="border-bottom:0;border-top:1px dashed #9ca3af;padding-top:12px;margin-top:16px;">
                        <div class="muted">Obrigado pela preferencia!</div>
                        <div class="muted">${new Date().toLocaleString('pt-BR')}</div>
                    </section>
                </main>
                <script>
                    window.addEventListener('load', function () {
                        window.print();
                    });
                </script>
            </body>
        </html>
    `);
    receiptWindow.document.close();
}
