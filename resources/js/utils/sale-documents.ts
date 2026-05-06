import { jsPDF } from 'jspdf';
import {
    formatCurrencyBR,
    formatDateBR,
    translatePaymentMethod,
    translateStatus,
} from '@/lib/format';
import type { Sale } from '@/schemas/sale';

export type ThermalPaperWidth = '58mm' | '80mm';

function resolveCustomerName(sale: Sale): string {
    return sale.customer_name?.trim() || `Cliente #${sale.customer_id}`;
}

function renderInstallmentSummary(sale: Sale): string | null {
    if ((sale.installments ?? 1) <= 1) {
        return null;
    }

    const amount = formatCurrencyBR(
        Number(sale.installment_value ?? sale.total),
    );
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

function buildInvoiceFileName(sale: Sale): string {
    const customerName = resolveCustomerName(sale)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();

    return `comprovante-venda-${sale.id}-${customerName || 'cliente'}-${sale.date}.pdf`;
}

function renderDigitalDocumentMarkup(sale: Sale): string {
    const customerName = resolveCustomerName(sale);
    const installmentSummary = renderInstallmentSummary(sale);
    const translatedStatus = translateStatus(sale.status);
    const itemsMarkup = (sale.items ?? [])
        .map(
            (item) => `
                <div class="product-row">
                    <div class="product-row__content">
                        <div class="product-row__title">${resolveProductLabel(item)}</div>
                        <div class="product-row__meta">${item.quantity}x ${formatCurrencyBR(item.unit_price)} cada</div>
                    </div>
                    <div class="product-row__total">${formatCurrencyBR(item.subtotal)}</div>
                </div>
            `,
        )
        .join('');

    return `
        <section class="digital-sheet">
            <header class="digital-sheet__hero">
                <h1>Resumo da venda</h1>
                <p>Emitido em ${formatDateBR(sale.date)} - Venda #${sale.id}</p>
            </header>

            <section class="digital-sheet__grid">
                <div class="info-card">
                    <span class="info-card__label">Cliente</span>
                    <strong>${customerName}</strong>
                    <span class="info-card__label">Valor total</span>
                    <strong>${formatCurrencyBR(sale.total)}</strong>
                </div>
                <div class="info-card">
                    <span class="info-card__label">Data da venda</span>
                    <strong>${formatDateBR(sale.date)}</strong>
                    <span class="info-card__label">Situacao</span>
                    <strong>${translatedStatus}</strong>
                </div>
            </section>

            <section class="digital-block">
                <h2>Produtos</h2>
                ${itemsMarkup || '<p class="muted">Nenhum item encontrado.</p>'}
            </section>

            <section class="digital-block">
                <div class="block-header">
                    <h2>Pagamento</h2>
                    <span class="status-pill">${sale.status === 'pending' ? 'Pendente' : 'Liquidado'}</span>
                </div>
                <div class="payment-row">
                    <span>${translatePaymentMethod(sale.payment_method)}</span>
                    <strong>${formatCurrencyBR(sale.total)}</strong>
                </div>
                ${
                    installmentSummary
                        ? `<p class="muted">${installmentSummary}</p>`
                        : ''
                }
                <p class="muted">Categorias: ${resolveCategorySummary(sale)}</p>
            </section>

            <section class="digital-summary">
                <div><span>Valor original</span><strong>${formatCurrencyBR(sale.subtotal)}</strong></div>
                <div><span>Desconto</span><strong>${formatCurrencyBR(0)}</strong></div>
                <div><span>Valor final</span><strong>${formatCurrencyBR(sale.total)}</strong></div>
                <div><span>Valor pago</span><strong>${formatCurrencyBR(sale.status === 'completed' ? sale.total : 0)}</strong></div>
                <div><span>Valor restante</span><strong>${formatCurrencyBR(sale.status === 'completed' ? 0 : sale.total)}</strong></div>
            </section>
        </section>
    `;
}

function renderThermalDocumentMarkup(
    sale: Sale,
    paperWidth: ThermalPaperWidth,
): string {
    const customerName = resolveCustomerName(sale);
    const installmentSummary = renderInstallmentSummary(sale);
    const translatedStatus = translateStatus(sale.status);
    const separator =
        paperWidth === '58mm'
            ? '======================'
            : '================================';
    const itemsMarkup = (sale.items ?? [])
        .map(
            (item) => `
                <div class="line-item">
                    <div class="line-item__header">
                        <div class="line-item__name">${resolveProductLabel(item)}</div>
                        <div class="line-item__price">${formatCurrencyBR(item.subtotal)}</div>
                    </div>
                    <div class="line-item__details">
                        <span>${item.quantity}x ${formatCurrencyBR(item.unit_price)}</span>
                        ${
                            item.category_name
                                ? `<span>${item.category_name}</span>`
                                : '<span>-</span>'
                        }
                    </div>
                </div>
            `,
        )
        .join('');

    return `
        <main class="receipt receipt--${paperWidth}">
            <section class="header">
                <div class="receipt-subtitle">Comprovante de venda</div>
                <div class="receipt__separator">${separator}</div>
                <div class="receipt-meta">
                    <div class="receipt-row receipt-row--inline">Data: ${formatDateBR(sale.date)}</div>
                    <div class="receipt-row receipt-row--inline">Venda: #${sale.id}</div>
                </div>
                <div class="receipt-customer">
                    <div class="receipt-customer__label">Cliente</div>
                    <div class="receipt-customer__name">${customerName}</div>
                </div>
            </section>

            <section class="section">
                <div class="section-title">Produtos</div>
                ${itemsMarkup || '<div class="muted">Nenhum item encontrado.</div>'}
            </section>

            <section class="section">
                <div class="receipt__separator">${separator}</div>
                <div class="section-title">Pagamento</div>
                <div class="receipt-row">${translatePaymentMethod(sale.payment_method)}</div>
                <div class="receipt-row">Status: ${translatedStatus}</div>
                ${
                    installmentSummary
                        ? `<div class="receipt-row">${installmentSummary}</div>`
                        : ''
                }
                <div class="receipt-row">Categorias: ${resolveCategorySummary(sale)}</div>
            </section>

            <section class="totals">
                <div class="receipt__separator">${separator}</div>
                <div class="section-title">Resumo</div>
                <div class="receipt-summary-row">
                    <span>Subtotal</span>
                    <strong>${formatCurrencyBR(sale.subtotal)}</strong>
                </div>
                <div class="receipt-summary-row receipt-summary-row--highlight">
                    <span>Total</span>
                    <strong>${formatCurrencyBR(sale.total)}</strong>
                </div>
                <div class="receipt-summary-row">
                    <span>Pago</span>
                    <strong>${formatCurrencyBR(sale.status === 'completed' ? sale.total : 0)}</strong>
                </div>
                <div class="receipt-summary-row">
                    <span>Restante</span>
                    <strong>${formatCurrencyBR(sale.status === 'completed' ? 0 : sale.total)}</strong>
                </div>
                <div class="totals__status">Status final: ${translatedStatus}</div>
            </section>

            <section class="footer">
                <div class="receipt__separator">${separator}</div>
                <div class="receipt-footer__thanks">Obrigado pela preferencia</div>
                <div class="receipt-row">Emitido em ${new Date().toLocaleString('pt-BR')}</div>
            </section>
        </main>
    `;
}

function buildDocumentStyles(paperWidth: ThermalPaperWidth): string {
    const thermalContentWidth = paperWidth === '58mm' ? '48mm' : '72mm';

    return `
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 0;
            color: #111827;
            background: #f5f5f5;
            font-family: Arial, sans-serif;
        }
        .preview-shell {
            min-height: 100vh;
            padding: 24px;
            display: flex;
            justify-content: center;
        }
        .digital-sheet {
            width: 100%;
            max-width: 760px;
            background: #ffffff;
            box-shadow: 0 18px 50px rgba(15, 23, 42, .12);
        }
        .digital-sheet__hero {
            padding: 20px 24px;
            background: #f4f4f5;
        }
        .digital-sheet__hero h1 {
            margin: 0 0 8px;
            font-size: 20px;
        }
        .digital-sheet__hero p {
            margin: 0;
            color: #71717a;
            font-size: 14px;
        }
        .digital-sheet__grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            padding: 24px;
        }
        .info-card {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
            display: grid;
            gap: 8px;
        }
        .info-card__label {
            color: #71717a;
            font-size: 13px;
        }
        .digital-block {
            padding: 0 24px 24px;
        }
        .digital-block h2 {
            margin: 0 0 14px;
            font-size: 16px;
        }
        .block-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 14px;
        }
        .status-pill {
            padding: 6px 12px;
            border-radius: 999px;
            background: #fef3c7;
            color: #b45309;
            font-size: 12px;
            font-weight: 600;
        }
        .product-row,
        .payment-row,
        .digital-summary div {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .product-row__content {
            min-width: 0;
        }
        .product-row__title {
            font-weight: 700;
            margin-bottom: 4px;
        }
        .product-row__meta,
        .muted {
            color: #71717a;
            font-size: 13px;
        }
        .product-row__total {
            font-weight: 700;
            white-space: nowrap;
        }
        .digital-summary {
            background: #f8fafc;
            padding: 16px 24px 24px;
        }
        .receipt {
            width: ${thermalContentWidth};
            max-width: ${thermalContentWidth};
            margin: 0 auto;
            padding: 10px 8px;
            background: #fff;
            font-family: "Courier New", monospace;
            color: #000;
            font-weight: 700;
            line-height: 1.45;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            border: 1px solid #e5e7eb;
        }
        .header,
        .footer {
            text-align: left;
            padding-bottom: 0;
            margin-bottom: 10px;
        }
        .receipt-subtitle {
            text-align: center;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: .08em;
            color: #444;
            margin-bottom: 4px;
        }
        .footer {
            padding-top: 0;
            margin-top: 10px;
            margin-bottom: 0;
        }
        .receipt-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-top: 2px;
        }
        .receipt-row {
            color: #000;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 3px;
            white-space: normal;
            word-break: break-word;
            overflow-wrap: anywhere;
        }
        .receipt-row--inline {
            white-space: nowrap;
            word-break: normal;
            overflow-wrap: normal;
            margin-bottom: 0;
        }
        .receipt-row--strong {
            font-size: 13px;
            font-weight: 800;
        }
        .receipt__separator {
            color: #000;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            margin: 6px 0 8px;
            text-align: center;
        }
        .receipt-customer {
            margin-top: 6px;
            text-align: left;
            padding: 6px 0 0;
        }
        .receipt-customer__label {
            color: #000;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .04em;
            margin-bottom: 3px;
        }
        .receipt-customer__name {
            color: #000;
            font-size: 13px;
            font-weight: 800;
            line-height: 1.3;
            white-space: normal;
            word-break: break-word;
            overflow-wrap: anywhere;
            margin-bottom: 2px;
        }
        .section {
            margin-bottom: 10px;
        }
        .section-title {
            margin-bottom: 6px;
            font-size: 12px;
            text-transform: uppercase;
            color: #000;
            letter-spacing: .06em;
            font-weight: 700;
            text-align: center;
        }
        .line-item {
            padding: 8px 0 6px;
            border-bottom: 1px dashed #d4d4d8;
        }
        .line-item:last-child {
            border-bottom: 0;
        }
        .line-item__header,
        .receipt-summary-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 8px;
        }
        .line-item__name {
            font-size: 13px;
            font-weight: 800;
            white-space: normal;
            overflow-wrap: anywhere;
            margin-bottom: 2px;
            flex: 1;
        }
        .line-item__price {
            font-size: 12px;
            font-weight: 800;
            white-space: nowrap;
        }
        .line-item__details {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            font-size: 11px;
            color: #52525b;
            margin-top: 2px;
        }
        .line-item__meta,
        .line-item__total {
            font-size: 12px;
            color: #000;
            font-weight: 700;
            margin-bottom: 2px;
        }
        .receipt--58mm {
            padding: 8px 6px;
        }
        .receipt--58mm .receipt-meta {
            gap: 6px;
        }
        .receipt--58mm .receipt-row,
        .receipt--58mm .muted,
        .receipt--58mm .line-item__meta,
        .receipt--58mm .line-item__total,
        .receipt--58mm .section,
        .receipt--58mm .totals {
            font-size: 11px;
        }
        .receipt--58mm .receipt-row--inline {
            font-size: 10px;
        }
        .receipt--58mm .line-item__name {
            font-size: 12px;
        }
        .receipt--58mm .section-title {
            font-size: 11px;
        }
        .receipt--58mm .receipt-customer__label {
            font-size: 10px;
        }
        .receipt--58mm .receipt__separator {
            font-size: 10px;
        }
        .receipt--58mm .receipt-customer__name {
            font-size: 12px;
        }
        .receipt--58mm .receipt-brand {
            font-size: 14px;
        }
        .receipt--58mm .receipt-subtitle,
        .receipt--58mm .line-item__details {
            font-size: 10px;
        }
        .totals {
            padding-top: 0;
            font-size: 13px;
        }
        .receipt-summary-row {
            font-size: 12px;
            margin-bottom: 4px;
        }
        .receipt-summary-row strong {
            white-space: nowrap;
        }
        .receipt-summary-row--highlight {
            font-size: 13px;
            padding: 4px 0;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            margin: 6px 0;
        }
        .totals__status {
            margin-top: 8px;
            text-align: left;
            font-weight: 800;
            color: #000;
        }
        .receipt-footer__thanks {
            text-align: center;
            font-size: 11px;
            margin-bottom: 4px;
        }
        .receipt .muted,
        .receipt .header .muted,
        .receipt .footer .muted {
            color: #000;
            font-weight: 700;
        }
        @media print {
            @page {
                size: ${paperWidth} auto;
                margin: 0;
            }
            body {
                background: #fff;
            }
            .preview-shell {
                padding: 0;
            }
            .digital-sheet,
            .receipt {
                box-shadow: none;
                border: 0;
            }
        }
    `;
}

export function buildSaleDocumentPreviewHtml(
    sale: Sale,
    mode: 'digital' | 'thermal',
    paperWidth: ThermalPaperWidth = '58mm',
): string {
    const markup =
        mode === 'digital'
            ? renderDigitalDocumentMarkup(sale)
            : renderThermalDocumentMarkup(sale, paperWidth);

    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
            <head>
                <meta charset="utf-8" />
                <title></title>
                <style>${buildDocumentStyles(paperWidth)}</style>
            </head>
            <body>
                <div class="preview-shell">
                    ${markup}
                </div>
            </body>
        </html>
    `;
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
    const paymentStatus = sale.status === 'pending' ? 'Pendente' : 'Liquidado';
    const pageWidth = 210;
    const contentLeft = 16;
    const contentRight = 194;
    const contentWidth = contentRight - contentLeft;
    const cardGap = 10;
    const cardWidth = (contentWidth - cardGap) / 2;

    const drawMutedText = (text: string, x: number, y: number): void => {
        document.setFont('helvetica', 'normal');
        document.setFontSize(10);
        document.setTextColor(113, 113, 122);
        document.text(text, x, y);
    };

    const drawStrongText = (
        text: string,
        x: number,
        y: number,
        options?: Parameters<typeof document.text>[3],
    ): void => {
        document.setFont('helvetica', 'bold');
        document.setFontSize(11);
        document.setTextColor(17, 24, 39);
        document.text(text, x, y, options);
    };

    document.setFillColor(244, 244, 245);
    document.rect(0, 0, pageWidth, 34, 'F');
    document.setFont('helvetica', 'bold');
    document.setFontSize(18);
    document.setTextColor(24, 24, 27);
    document.text('Resumo da venda', contentLeft, 14);
    document.setFontSize(11);
    document.setFont('helvetica', 'normal');
    document.setTextColor(113, 113, 122);
    document.text(
        `Emitido em ${formatDateBR(sale.date)} - Venda #${sale.id}`,
        contentLeft,
        24,
    );

    document.setDrawColor(229, 231, 235);
    document.setFillColor(255, 255, 255);
    document.roundedRect(contentLeft, 44, cardWidth, 36, 3, 3, 'FD');
    document.roundedRect(
        contentLeft + cardWidth + cardGap,
        44,
        cardWidth,
        36,
        3,
        3,
        'FD',
    );

    drawMutedText('Cliente', 20, 53);
    drawStrongText(customerName, 20, 62);
    drawMutedText('Valor total', 20, 72);
    document.setFont('helvetica', 'bold');
    document.setFontSize(13);
    document.setTextColor(17, 24, 39);
    document.text(formatCurrencyBR(sale.total), 20, 78);

    const rightCardX = contentLeft + cardWidth + cardGap + 4;
    drawMutedText('Data da venda', rightCardX, 53);
    drawStrongText(formatDateBR(sale.date), rightCardX, 62);
    drawMutedText('Situacao', rightCardX, 72);
    document.setFont('helvetica', 'bold');
    document.setFontSize(13);
    document.setTextColor(17, 24, 39);
    document.text(translatedStatus, rightCardX, 78);

    let y = 94;

    document.setFont('helvetica', 'bold');
    document.setFontSize(14);
    document.setTextColor(24, 24, 27);
    document.text('Produtos', contentLeft, y);
    y += 8;

    if (items.length === 0) {
        drawMutedText('Nenhum item encontrado.', contentLeft, y);
        y += 8;
    } else {
        items.forEach((item) => {
            const productLabel = resolveProductLabel(item);
            const productMeta = `${item.quantity}x ${formatCurrencyBR(item.unit_price)} cada`;
            const productLines = document.splitTextToSize(
                productLabel,
                contentWidth - 36,
            );
            const metaLines = document.splitTextToSize(
                productMeta,
                contentWidth - 36,
            );

            document.setDrawColor(241, 245, 249);
            document.line(contentLeft, y - 2, contentRight, y - 2);
            drawStrongText(productLines, contentLeft, y);
            document.setFont('helvetica', 'bold');
            document.setFontSize(11);
            document.setTextColor(17, 24, 39);
            document.text(formatCurrencyBR(item.subtotal), contentRight, y, {
                align: 'right',
            });
            y += productLines.length * 5;
            document.setFont('helvetica', 'normal');
            document.setFontSize(10);
            document.setTextColor(113, 113, 122);
            document.text(metaLines, contentLeft, y);
            y += metaLines.length * 4 + 5;
        });
    }

    y += 6;

    document.setFont('helvetica', 'bold');
    document.setFontSize(14);
    document.setTextColor(24, 24, 27);
    document.text('Pagamento', contentLeft, y);
    document.setFillColor(254, 243, 199);
    document.setTextColor(180, 83, 9);
    document.roundedRect(contentRight - 28, y - 5, 28, 8, 4, 4, 'F');
    document.setFont('helvetica', 'bold');
    document.setFontSize(9);
    document.text(paymentStatus, contentRight - 14, y, {
        align: 'center',
    });
    y += 10;

    document.setFont('helvetica', 'normal');
    document.setFontSize(10);
    document.setTextColor(17, 24, 39);
    document.text(translatePaymentMethod(sale.payment_method), contentLeft, y);
    drawStrongText(formatCurrencyBR(sale.total), contentRight, y, {
        align: 'right',
    });
    y += 8;

    if (installmentSummary) {
        drawMutedText(installmentSummary, contentLeft, y);
        y += 7;
    }

    drawMutedText(
        `Categorias: ${resolveCategorySummary(sale)}`,
        contentLeft,
        y,
    );
    y += 12;

    document.setFillColor(249, 250, 251);
    document.rect(0, y, pageWidth, 50, 'F');
    y += 12;

    const summaryRows: Array<[string, string]> = [
        ['Valor original', formatCurrencyBR(sale.subtotal)],
        ['Desconto', formatCurrencyBR(0)],
        ['Valor final', formatCurrencyBR(sale.total)],
        [
            'Valor pago',
            formatCurrencyBR(sale.status === 'completed' ? sale.total : 0),
        ],
        [
            'Valor restante',
            formatCurrencyBR(sale.status === 'completed' ? 0 : sale.total),
        ],
    ];

    summaryRows.forEach(([label, value], index) => {
        document.setFont('helvetica', 'normal');
        document.setFontSize(11);
        document.setTextColor(24, 24, 27);
        document.text(label, contentLeft, y);
        document.setFont('helvetica', 'bold');
        document.text(value, contentRight, y, { align: 'right' });
        y += index === 1 ? 9 : 8;
    });

    document.save(buildInvoiceFileName(sale));
}

export function printSaleThermalReceipt(
    sale: Sale,
    paperWidth: ThermalPaperWidth = '58mm',
): void {
    const receiptWindow = window.open('', '_blank', 'width=420,height=760');

    if (!receiptWindow) {
        return;
    }

    receiptWindow.document.write(
        buildSaleDocumentPreviewHtml(sale, 'thermal', paperWidth),
    );
    receiptWindow.document.write(`
        <script>
            window.addEventListener('load', function () {
                document.title = '';
                window.print();
            });
        </script>
    `);
    receiptWindow.document.close();
}
