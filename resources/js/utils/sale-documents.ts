import { jsPDF } from 'jspdf';
import { formatCurrencyBR, formatDateBR, translatePaymentMethod } from '@/lib/format';
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

export function downloadSaleInvoicePdf(sale: Sale): void {
    const document = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });
    const customerName = resolveCustomerName(sale);
    const installmentSummary = renderInstallmentSummary(sale);
    const items = sale.items ?? [];

    document.setFillColor(249, 115, 22);
    document.rect(0, 0, 210, 38, 'F');
    document.setFont('helvetica', 'bold');
    document.setFontSize(20);
    document.setTextColor(255, 255, 255);
    document.text('Fatura de venda', 16, 18);
    document.setFontSize(10);
    document.setFont('helvetica', 'normal');
    document.text(`Venda #${sale.id}`, 16, 26);
    document.text(`Emitido em ${formatDateBR(sale.date)}`, 16, 31);

    document.setTextColor(17, 24, 39);
    document.setFont('helvetica', 'bold');
    document.setFontSize(12);
    document.text('Resumo', 16, 52);
    document.setFont('helvetica', 'normal');
    document.setFontSize(10);
    document.text(`Cliente: ${customerName}`, 16, 60);
    document.text(`Forma de pagamento: ${translatePaymentMethod(sale.payment_method)}`, 16, 66);
    document.text(`Status: ${sale.status}`, 16, 72);

    if (installmentSummary) {
        document.text(installmentSummary, 16, 78);
    }

    let y = installmentSummary ? 92 : 84;

    document.setFont('helvetica', 'bold');
    document.text('Itens', 16, y);
    y += 7;
    document.setFont('helvetica', 'normal');

    if (items.length === 0) {
        document.text('Nenhum item encontrado para esta venda.', 16, y);
        y += 8;
    } else {
        items.forEach((item) => {
            const line = `Produto #${item.product_id}  |  Qtd ${item.quantity}  |  Unit ${formatCurrencyBR(item.unit_price)}  |  Total ${formatCurrencyBR(item.subtotal)}`;
            document.text(line, 16, y);
            y += 7;
        });
    }

    y += 4;
    document.setDrawColor(229, 231, 235);
    document.line(16, y, 194, y);
    y += 10;

    document.setFont('helvetica', 'bold');
    document.setFontSize(12);
    document.text(`Subtotal: ${formatCurrencyBR(sale.subtotal)}`, 16, y);
    y += 8;
    document.text(`Total: ${formatCurrencyBR(sale.total)}`, 16, y);

    document.save(`fatura-venda-${sale.id}.pdf`);
}

export function printSaleThermalReceipt(sale: Sale): void {
    const receiptWindow = window.open('', '_blank', 'width=420,height=760');

    if (!receiptWindow) {
        return;
    }

    const customerName = resolveCustomerName(sale);
    const installmentSummary = renderInstallmentSummary(sale);
    const itemsMarkup = (sale.items ?? [])
        .map(
            (item) => `
                <div class="line-item">
                    <div class="line-item__name">Produto #${item.product_id}</div>
                    <div class="line-item__meta">${item.quantity} x ${formatCurrencyBR(item.unit_price)}</div>
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
                <title>Comprovante venda #${sale.id}</title>
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
                        font-size: 18px;
                        margin: 0 0 6px;
                    }
                    .muted {
                        font-size: 12px;
                        color: #4b5563;
                    }
                    .section {
                        margin-bottom: 12px;
                    }
                    .section-title {
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: .06em;
                        color: #6b7280;
                        margin-bottom: 6px;
                    }
                    .line-item {
                        border-bottom: 1px dashed #e5e7eb;
                        padding: 8px 0;
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
                        <h1>Comprovante de venda</h1>
                        <div class="muted">Venda #${sale.id}</div>
                        <div class="muted">${formatDateBR(sale.date)}</div>
                    </section>

                    <section class="section">
                        <div class="section-title">Cliente</div>
                        <div>${customerName}</div>
                    </section>

                    <section class="section">
                        <div class="section-title">Pagamento</div>
                        <div>${translatePaymentMethod(sale.payment_method)}</div>
                        ${installmentSummary ? `<div class="muted">${installmentSummary}</div>` : ''}
                    </section>

                    <section class="section">
                        <div class="section-title">Itens</div>
                        ${itemsMarkup || '<div class="muted">Nenhum item encontrado.</div>'}
                    </section>

                    <section class="totals">
                        <div>Subtotal: ${formatCurrencyBR(sale.subtotal)}</div>
                        <strong>Total: ${formatCurrencyBR(sale.total)}</strong>
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
