import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    formatCurrencyBR,
    formatDateBR,
    translatePaymentMethod,
    translateStatus,
} from '@/lib/format';
import type { Sale } from '@/schemas/sale';
import {
    describeInstallments,
    splitSaleInstallments,
} from '@/utils/sale-installments';
import { todayString } from '@/utils/sales-dialog';

export type ThermalPaperWidth = '58mm' | '80mm';

function resolveCustomerName(sale: Sale): string {
    return sale.customer_name?.trim() || `Cliente #${sale.customer_id}`;
}

export function hasDiscount(sale: Sale): boolean {
    return Number(sale.discount ?? 0) > 0;
}

export function formatDiscount(sale: Sale): string {
    const discount = Number(sale.discount ?? 0);

    return discount > 0
        ? `- ${formatCurrencyBR(discount)}`
        : formatCurrencyBR(0);
}

function renderInstallmentSummary(sale: Sale): string | null {
    if ((sale.installments ?? 1) <= 1) {
        return null;
    }

    const firstDate = sale.first_installment_date
        ? formatDateBR(sale.first_installment_date)
        : formatDateBR(sale.date);

    return `${describeInstallments(splitSaleInstallments(sale))} - primeira parcela em ${firstDate}`;
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

function buildInvoiceFileName(sale: Sale, suffix = ''): string {
    const customerName = resolveCustomerName(sale)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();

    const number = sale.id > 0 ? sale.id : 'nova';

    return `comprovante-venda-${number}-${customerName || 'cliente'}-${sale.date}${suffix}.pdf`;
}

const DOCUMENT_PAYMENT_LABELS: Record<string, string> = {
    money: 'Dinheiro',
    cash: 'Dinheiro',
    pix: 'PIX',
    card: 'Cartão',
    credit: 'Cartão de crédito',
    debit: 'Cartão de débito',
    installment: 'Parcelado',
    crediario: 'Crediário',
    boleto: 'Boleto',
};

type ReceiptTone = 'paid' | 'pending' | 'cancelled';

type ReceiptInstallment = {
    label: string;
    dueDate: string;
    amount: number;
};

type ReceiptData = {
    number: string;
    issuedAt: string;
    customerName: string;
    date: string;
    paymentLabel: string;
    status: { label: string; tone: ReceiptTone };
    items: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
    }>;
    subtotal: number;
    discount: number;
    total: number;
    balanceRows: Array<[string, number]>;
    installmentSummary: string | null;
    installments: ReceiptInstallment[];
    notes: string;
};

const RECEIPT_STATUS: Record<Sale['status'], ReceiptData['status']> = {
    completed: { label: 'Paga', tone: 'paid' },
    pending: { label: 'Pendente', tone: 'pending' },
    cancelled: { label: 'Cancelada', tone: 'cancelled' },
};

const RECEIPT_TONE_RGB: Record<
    ReceiptTone,
    { text: [number, number, number]; fill: [number, number, number] }
> = {
    paid: { text: [4, 120, 87], fill: [209, 250, 229] },
    pending: { text: [180, 83, 9], fill: [254, 243, 199] },
    cancelled: { text: [185, 28, 28], fill: [254, 226, 226] },
};

const ACCENT_RGB: [number, number, number] = [228, 132, 74];

/**
 * What was paid at checkout and what is still open. A pending crediário already received
 * its entry; looking only at the status printed "Pago R$ 0,00" for it.
 */
export function getSaleBalance(sale: Sale): {
    paid: number;
    remaining: number;
} {
    const total = Number(sale.total ?? 0);

    if (sale.status === 'completed') {
        return { paid: total, remaining: 0 };
    }

    if (sale.status === 'cancelled') {
        return { paid: 0, remaining: 0 };
    }

    const paid =
        sale.payment_method === 'crediario'
            ? Math.min(total, Number(sale.crediario_entry ?? 0))
            : 0;

    return { paid, remaining: Math.max(0, total - paid) };
}

export function formatSaleNumber(sale: Sale, prefix = 'Venda '): string {
    return sale.id > 0 ? `${prefix}#${sale.id}` : 'Nova venda';
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function addMonthsToDate(date: string, months: number): string {
    const [year, month, day] = date.slice(0, 10).split('-').map(Number);
    const target = new Date(year, month - 1 + months, 1);
    const lastDay = new Date(
        target.getFullYear(),
        target.getMonth() + 1,
        0,
    ).getDate();

    target.setDate(Math.min(day, lastDay));

    return [
        target.getFullYear(),
        String(target.getMonth() + 1).padStart(2, '0'),
        String(target.getDate()).padStart(2, '0'),
    ].join('-');
}

function addDaysToDate(date: string, days: number): string {
    const [year, month, day] = date.slice(0, 10).split('-').map(Number);
    const target = new Date(year, month - 1, day + days);

    return [
        target.getFullYear(),
        String(target.getMonth() + 1).padStart(2, '0'),
        String(target.getDate()).padStart(2, '0'),
    ].join('-');
}

function buildReceiptData(sale: Sale): ReceiptData {
    const total = Number(sale.total ?? 0);
    const discount = Number(sale.discount ?? 0);
    const entry = Number(sale.crediario_entry ?? 0);
    const installmentsCount = sale.installments ?? 1;
    const isCrediario = sale.payment_method === 'crediario';
    const methodLabel =
        DOCUMENT_PAYMENT_LABELS[sale.payment_method] ??
        translatePaymentMethod(sale.payment_method);
    const amounts = splitSaleInstallments(sale);
    const firstDueDate =
        sale.first_installment_date || addDaysToDate(sale.date, 30);

    const balanceRows: Array<[string, number]> = [];

    if (sale.status === 'completed') {
        balanceRows.push(['Pago', total]);
    } else if (sale.status === 'pending' && isCrediario) {
        balanceRows.push(['Entrada paga', entry]);
        balanceRows.push(['A pagar no crediário', Math.max(0, total - entry)]);
    } else if (sale.status === 'pending') {
        balanceRows.push(['A pagar', total]);
    }

    return {
        number: formatSaleNumber(sale),
        issuedAt: formatDateBR(todayString()),
        customerName: resolveCustomerName(sale),
        date: formatDateBR(sale.date),
        paymentLabel:
            installmentsCount > 1
                ? `${methodLabel} em ${installmentsCount}x`
                : methodLabel,
        status: RECEIPT_STATUS[sale.status] ?? {
            label: translateStatus(sale.status),
            tone: 'pending',
        },
        items: (sale.items ?? []).map((item) => ({
            name: resolveProductLabel(item),
            quantity: item.quantity,
            unitPrice: Number(item.unit_price),
            subtotal: Number(item.subtotal),
        })),
        subtotal: Number(sale.subtotal ?? 0),
        discount,
        total,
        balanceRows,
        installmentSummary:
            installmentsCount > 1 ? describeInstallments(amounts) : null,
        installments: isCrediario
            ? amounts.map((amount, index) => ({
                  label: `${index + 1}/${amounts.length}`,
                  dueDate: formatDateBR(addMonthsToDate(firstDueDate, index)),
                  amount,
              }))
            : [],
        notes: sale.notes?.trim() ?? '',
    };
}

function renderDigitalDocumentMarkup(sale: Sale): string {
    const data = buildReceiptData(sale);
    const itemsMarkup = data.items
        .map(
            (item) => `
                <tr>
                    <td class="items__name">${escapeHtml(item.name)}</td>
                    <td class="items__qty">${item.quantity}</td>
                    <td class="items__money items__unit">${formatCurrencyBR(item.unitPrice)}</td>
                    <td class="items__money"><strong>${formatCurrencyBR(item.subtotal)}</strong></td>
                </tr>
            `,
        )
        .join('');
    const installmentsMarkup = data.installments
        .map(
            (installment) => `
                <tr>
                    <td>${installment.label}</td>
                    <td>${installment.dueDate}</td>
                    <td class="items__money">${formatCurrencyBR(installment.amount)}</td>
                </tr>
            `,
        )
        .join('');
    const balanceMarkup = data.balanceRows
        .map(
            ([label, value]) =>
                `<div class="totals__row totals__row--muted"><span>${label}</span><strong>${formatCurrencyBR(value)}</strong></div>`,
        )
        .join('');

    return `
        <article class="doc">
            <div class="doc__bar"></div>
            <header class="doc__header">
                <div>
                    <h1>Comprovante de venda</h1>
                    <p class="muted">Emitido em ${data.issuedAt}</p>
                </div>
                <div class="doc__number">${data.number}</div>
            </header>

            <section class="facts">
                <div class="fact">
                    <span class="fact__label">Cliente</span>
                    <strong>${escapeHtml(data.customerName)}</strong>
                </div>
                <div class="fact">
                    <span class="fact__label">Data da venda</span>
                    <strong>${data.date}</strong>
                </div>
                <div class="fact">
                    <span class="fact__label">Pagamento</span>
                    <strong>${data.paymentLabel}</strong>
                </div>
                <div class="fact">
                    <span class="fact__label">Situação</span>
                    <span class="pill pill--${data.status.tone}">${data.status.label}</span>
                </div>
            </section>

            <section class="doc__section">
                <h2>Itens</h2>
                ${
                    itemsMarkup
                        ? `<table class="items">
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th class="items__qty">Qtd</th>
                                    <th class="items__money items__unit">Valor unit.</th>
                                    <th class="items__money">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>${itemsMarkup}</tbody>
                        </table>`
                        : '<p class="muted">Nenhum item encontrado.</p>'
                }
            </section>

            <section class="doc__section doc__bottom">
                <div class="payment">
                    <h2>Pagamento</h2>
                    <p><strong>${data.paymentLabel}</strong></p>
                    ${data.installmentSummary ? `<p class="muted">${data.installmentSummary}</p>` : ''}
                    ${
                        installmentsMarkup
                            ? `<table class="items items--compact">
                                <thead>
                                    <tr><th>Parcela</th><th>Vencimento</th><th class="items__money">Valor</th></tr>
                                </thead>
                                <tbody>${installmentsMarkup}</tbody>
                            </table>`
                            : ''
                    }
                </div>
                <div class="totals">
                    <div class="totals__row"><span>Subtotal</span><strong>${formatCurrencyBR(data.subtotal)}</strong></div>
                    ${
                        data.discount > 0
                            ? `<div class="totals__row totals__row--discount"><span>Desconto</span><strong>- ${formatCurrencyBR(data.discount)}</strong></div>`
                            : ''
                    }
                    <div class="totals__row totals__row--total"><span>Total</span><strong>${formatCurrencyBR(data.total)}</strong></div>
                    ${balanceMarkup}
                </div>
            </section>

            ${
                data.notes
                    ? `<section class="doc__section"><h2>Observações</h2><p class="notes">${escapeHtml(data.notes)}</p></section>`
                    : ''
            }

            <footer class="doc__footer">Operis · ${data.number}</footer>
        </article>
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
                        <div class="line-item__name">${escapeHtml(resolveProductLabel(item))}</div>
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
                    <div class="receipt-row receipt-row--inline">${formatSaleNumber(sale, 'Venda: ')}</div>
                </div>
                <div class="receipt-customer">
                    <div class="receipt-customer__label">Cliente</div>
                    <div class="receipt-customer__name">${escapeHtml(customerName)}</div>
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
                ${
                    hasDiscount(sale)
                        ? `<div class="receipt-summary-row">
                    <span>Desconto</span>
                    <strong>${formatDiscount(sale)}</strong>
                </div>`
                        : ''
                }
                <div class="receipt-summary-row receipt-summary-row--highlight">
                    <span>Total</span>
                    <strong>${formatCurrencyBR(sale.total)}</strong>
                </div>
                <div class="receipt-summary-row">
                    <span>Pago</span>
                    <strong>${formatCurrencyBR(getSaleBalance(sale).paid)}</strong>
                </div>
                <div class="receipt-summary-row">
                    <span>Restante</span>
                    <strong>${formatCurrencyBR(getSaleBalance(sale).remaining)}</strong>
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
        .doc {
            width: 100%;
            max-width: 794px;
            background: #ffffff;
            box-shadow: 0 18px 50px rgba(15, 23, 42, .12);
            font-size: 14px;
        }
        .doc__bar {
            height: 6px;
            background: #e4844a;
        }
        .doc__header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            padding: 28px 32px 20px;
        }
        .doc__header h1 {
            margin: 0 0 4px;
            font-size: 24px;
        }
        .doc__number {
            font-size: 16px;
            font-weight: 700;
            white-space: nowrap;
        }
        .muted {
            margin: 0;
            color: #71717a;
            font-size: 13px;
        }
        .facts {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
            margin: 0 32px;
            padding: 16px 20px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            background: #fafafa;
        }
        .fact {
            display: grid;
            gap: 4px;
            min-width: 0;
            align-content: start;
        }
        .fact strong {
            overflow-wrap: anywhere;
        }
        .fact__label {
            color: #71717a;
            font-size: 12px;
        }
        .pill {
            justify-self: start;
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 700;
        }
        .pill--paid { background: #d1fae5; color: #047857; }
        .pill--pending { background: #fef3c7; color: #b45309; }
        .pill--cancelled { background: #fee2e2; color: #b91c1c; }
        .doc__section {
            padding: 24px 32px 0;
        }
        .doc__section h2 {
            margin: 0 0 10px;
            font-size: 15px;
        }
        .items {
            width: 100%;
            border-collapse: collapse;
        }
        .items th {
            padding: 9px 10px;
            background: #27272a;
            color: #ffffff;
            font-size: 12px;
            text-align: left;
        }
        .items td {
            padding: 9px 10px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: top;
        }
        .items tbody tr:nth-child(even) td {
            background: #fafafa;
        }
        .items__name {
            overflow-wrap: anywhere;
        }
        .items__qty {
            width: 48px;
            text-align: center !important;
        }
        .items__money {
            text-align: right !important;
            white-space: nowrap;
        }
        .items--compact th,
        .items--compact td {
            padding: 6px 8px;
            font-size: 13px;
        }
        .doc__bottom {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 280px;
            gap: 24px;
            align-items: start;
        }
        .payment p {
            margin: 0 0 6px;
        }
        .payment .items {
            margin-top: 10px;
        }
        .totals {
            padding: 14px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
        }
        .totals__row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 5px 0;
        }
        .totals__row strong {
            white-space: nowrap;
        }
        .totals__row--discount {
            color: #c2410c;
        }
        .totals__row--total {
            margin: 6px 0;
            padding: 10px 0;
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
            font-size: 18px;
        }
        .totals__row--muted {
            color: #52525b;
            font-size: 13px;
        }
        .notes {
            margin: 0;
            white-space: pre-line;
        }
        .doc__footer {
            margin-top: 28px;
            padding: 14px 32px;
            border-top: 1px solid #f1f5f9;
            color: #a1a1aa;
            font-size: 12px;
        }
        @media (max-width: 640px) {
            .preview-shell { padding: 0; }
            .doc { box-shadow: none; font-size: 13px; }
            .doc__header { padding: 20px 16px 14px; }
            .doc__header h1 { font-size: 19px; }
            .facts {
                grid-template-columns: repeat(2, minmax(0, 1fr));
                margin: 0 16px;
                padding: 12px 14px;
            }
            .doc__section { padding: 18px 16px 0; }
            .doc__bottom { grid-template-columns: 1fr; }
            .items__unit { display: none; }
            .items th, .items td { padding: 7px 6px; }
            .doc__footer { padding: 12px 16px; }
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
            .doc,
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
    const data = buildReceiptData(sale);
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const left = 16;
    const right = pageWidth - 16;
    const width = right - left;
    const bottomLimit = pageHeight - 22;
    const lastTableY = () =>
        (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
            .finalY;
    let y = 0;

    const setText = (
        size: number,
        style: 'normal' | 'bold',
        color: [number, number, number] = [24, 24, 27],
    ) => {
        doc.setFont('helvetica', style);
        doc.setFontSize(size);
        doc.setTextColor(...color);
    };
    const ensureSpace = (height: number) => {
        if (y + height > bottomLimit) {
            doc.addPage();
            y = 20;
        }
    };
    const heading = (text: string) => {
        ensureSpace(14);
        setText(12, 'bold');
        doc.text(text, left, y);
        y += 5;
    };
    const fitText = (text: string, maxWidth: number): string => {
        const [firstLine, ...rest] = doc.splitTextToSize(text, maxWidth);

        return rest.length > 0
            ? `${firstLine.replace(/\s*$/, '')}...`
            : firstLine;
    };

    doc.setFillColor(...ACCENT_RGB);
    doc.rect(0, 0, pageWidth, 3, 'F');

    setText(20, 'bold');
    doc.text('Comprovante de venda', left, 20);
    setText(9.5, 'normal', [113, 113, 122]);
    doc.text(`Emitido em ${data.issuedAt}`, left, 26.5);
    setText(13, 'bold');
    doc.text(data.number, right, 20, { align: 'right' });

    const factsTop = 34;
    const factsHeight = 20;
    const factWidth = width / 4;

    doc.setDrawColor(229, 231, 235);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(left, factsTop, width, factsHeight, 3, 3, 'FD');

    const facts: Array<[string, string]> = [
        ['Cliente', data.customerName],
        ['Data da venda', data.date],
        ['Pagamento', data.paymentLabel],
    ];

    facts.forEach(([label, value], index) => {
        const x = left + 5 + factWidth * index;

        setText(8.5, 'normal', [113, 113, 122]);
        doc.text(label, x, factsTop + 7.5);
        setText(10.5, 'bold');
        doc.text(fitText(value, factWidth - 8), x, factsTop + 14);
    });

    const statusX = left + 5 + factWidth * 3;
    const tone = RECEIPT_TONE_RGB[data.status.tone];

    setText(8.5, 'normal', [113, 113, 122]);
    doc.text('Situação', statusX, factsTop + 7.5);
    setText(9, 'bold', tone.text);
    const pillWidth = doc.getTextWidth(data.status.label) + 7;
    doc.setFillColor(...tone.fill);
    doc.roundedRect(statusX, factsTop + 10, pillWidth, 6, 3, 3, 'F');
    doc.text(data.status.label, statusX + pillWidth / 2, factsTop + 14.2, {
        align: 'center',
    });

    y = factsTop + factsHeight + 10;
    heading('Itens');

    autoTable(doc, {
        startY: y,
        head: [['Produto', 'Qtd', 'Valor unit.', 'Subtotal']],
        body: data.items.length
            ? data.items.map((item) => [
                  item.name,
                  String(item.quantity),
                  formatCurrencyBR(item.unitPrice),
                  formatCurrencyBR(item.subtotal),
              ])
            : [['Nenhum item encontrado.', '', '', '']],
        theme: 'plain',
        margin: { left, right: pageWidth - right, bottom: 22 },
        styles: {
            fontSize: 10,
            cellPadding: { top: 2.6, bottom: 2.6, left: 3, right: 3 },
            textColor: [39, 39, 42],
            lineColor: [241, 245, 249],
            lineWidth: { bottom: 0.3 },
        },
        headStyles: {
            fillColor: [39, 39, 42],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9.5,
            lineWidth: 0,
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        columnStyles: {
            1: { halign: 'center', cellWidth: 16 },
            2: { halign: 'right', cellWidth: 32 },
            3: { halign: 'right', cellWidth: 32, fontStyle: 'bold' },
        },
        didParseCell: (hook) => {
            if (hook.section === 'head' && hook.column.index > 0) {
                hook.cell.styles.halign =
                    hook.column.index === 1 ? 'center' : 'right';
            }
        },
    });

    y = lastTableY() + 10;

    const totalsRows: Array<{
        label: string;
        value: string;
        kind: 'normal' | 'discount' | 'total' | 'muted';
    }> = [
        {
            label: 'Subtotal',
            value: formatCurrencyBR(data.subtotal),
            kind: 'normal',
        },
        ...(data.discount > 0
            ? [
                  {
                      label: 'Desconto',
                      value: `- ${formatCurrencyBR(data.discount)}`,
                      kind: 'discount' as const,
                  },
              ]
            : []),
        { label: 'Total', value: formatCurrencyBR(data.total), kind: 'total' },
        ...data.balanceRows.map(([label, value]) => ({
            label,
            value: formatCurrencyBR(value),
            kind: 'muted' as const,
        })),
    ];
    const totalsWidth = 78;
    const totalsX = right - totalsWidth;
    const totalsHeight =
        8 +
        totalsRows.reduce(
            (sum, row) => sum + (row.kind === 'total' ? 11 : 6.5),
            0,
        );

    ensureSpace(totalsHeight + 4);

    const blockTop = y;

    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(totalsX, blockTop, totalsWidth, totalsHeight, 3, 3, 'S');

    let rowY = blockTop + 8;

    totalsRows.forEach((row) => {
        if (row.kind === 'total') {
            doc.setDrawColor(229, 231, 235);
            doc.line(totalsX + 5, rowY - 4, right - 5, rowY - 4);
            setText(13, 'bold');
            doc.text(row.label, totalsX + 5, rowY + 2);
            doc.text(row.value, right - 5, rowY + 2, { align: 'right' });
            doc.line(totalsX + 5, rowY + 5.5, right - 5, rowY + 5.5);
            rowY += 11;

            return;
        }

        const color: [number, number, number] =
            row.kind === 'discount'
                ? [194, 65, 12]
                : row.kind === 'muted'
                  ? [82, 82, 91]
                  : [39, 39, 42];

        setText(row.kind === 'muted' ? 9.5 : 10, 'normal', color);
        doc.text(row.label, totalsX + 5, rowY);
        setText(row.kind === 'muted' ? 9.5 : 10, 'bold', color);
        doc.text(row.value, right - 5, rowY, { align: 'right' });
        rowY += 6.5;
    });

    const paymentWidth = totalsX - left - 10;

    setText(12, 'bold');
    doc.text('Pagamento', left, blockTop + 4);
    setText(10.5, 'bold');
    doc.text(fitText(data.paymentLabel, paymentWidth), left, blockTop + 11);

    if (data.installmentSummary) {
        setText(9.5, 'normal', [113, 113, 122]);
        doc.text(
            doc.splitTextToSize(data.installmentSummary, paymentWidth),
            left,
            blockTop + 17,
        );
    }

    y = blockTop + totalsHeight + 10;

    if (data.installments.length > 0) {
        heading('Parcelas do crediário');

        autoTable(doc, {
            startY: y,
            head: [['Parcela', 'Vencimento', 'Valor']],
            body: data.installments.map((installment) => [
                installment.label,
                installment.dueDate,
                formatCurrencyBR(installment.amount),
            ]),
            theme: 'plain',
            margin: { left, right: pageWidth - right, bottom: 22 },
            tableWidth: 110,
            styles: {
                fontSize: 9.5,
                cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
                textColor: [39, 39, 42],
                lineColor: [241, 245, 249],
                lineWidth: { bottom: 0.3 },
            },
            headStyles: {
                fillColor: [244, 244, 245],
                textColor: [39, 39, 42],
                fontStyle: 'bold',
                lineWidth: 0,
            },
            columnStyles: { 2: { halign: 'right' } },
            didParseCell: (hook) => {
                if (hook.section === 'head' && hook.column.index === 2) {
                    hook.cell.styles.halign = 'right';
                }
            },
        });

        y = lastTableY() + 10;
    }

    if (data.notes) {
        heading('Observações');
        setText(10, 'normal', [63, 63, 70]);
        doc.splitTextToSize(data.notes, width).forEach((line: string) => {
            ensureSpace(6);
            doc.text(line, left, y);
            y += 5;
        });
    }

    const pageCount = doc.getNumberOfPages();

    for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page);
        doc.setDrawColor(241, 245, 249);
        doc.line(left, pageHeight - 14, right, pageHeight - 14);
        setText(8.5, 'normal', [161, 161, 170]);
        doc.text(`Operis · ${data.number}`, left, pageHeight - 9);
        doc.text(`Página ${page} de ${pageCount}`, right, pageHeight - 9, {
            align: 'right',
        });
    }

    doc.save(buildInvoiceFileName(sale));
}

/**
 * The thermal receipt as a PDF the size of the paper roll (80 mm wide, as tall as the
 * content), to send to the customer instead of printing.
 */
export function downloadSaleThermalPdf(sale: Sale): void {
    const pageWidth = 80;
    const margin = 4;
    const contentWidth = pageWidth - margin * 2;
    const lineHeight = 3.6;
    const customerName = resolveCustomerName(sale);
    const installmentSummary = renderInstallmentSummary(sale);
    const translatedStatus = translateStatus(sale.status);
    const balance = getSaleBalance(sale);

    type Line =
        | {
              kind: 'text';
              text: string;
              align?: 'left' | 'center';
              bold?: boolean;
              size?: number;
          }
        | {
              kind: 'pair';
              left: string;
              right: string;
              bold?: boolean;
              size?: number;
          }
        | { kind: 'separator' }
        | { kind: 'gap'; height: number };

    const lines: Line[] = [];
    const title = (text: string) => {
        lines.push({ kind: 'gap', height: 1 });
        lines.push({
            kind: 'text',
            text: text.toUpperCase(),
            align: 'center',
            bold: true,
        });
    };

    lines.push({
        kind: 'text',
        text: 'COMPROVANTE DE VENDA',
        align: 'center',
        bold: true,
        size: 10,
    });
    lines.push({ kind: 'separator' });
    lines.push({
        kind: 'pair',
        left: `Data: ${formatDateBR(sale.date)}`,
        right: formatSaleNumber(sale, 'Venda: '),
    });
    lines.push({ kind: 'gap', height: 1 });
    lines.push({ kind: 'text', text: 'Cliente' });
    lines.push({ kind: 'text', text: customerName, bold: true, size: 9.5 });

    title('Produtos');
    const items = sale.items ?? [];

    if (items.length === 0) {
        lines.push({ kind: 'text', text: 'Nenhum item encontrado.' });
    }

    items.forEach((item) => {
        lines.push({
            kind: 'pair',
            left: resolveProductLabel(item),
            right: formatCurrencyBR(item.subtotal),
            bold: true,
        });
        lines.push({
            kind: 'pair',
            left: `${item.quantity}x ${formatCurrencyBR(item.unit_price)}`,
            right: item.category_name || '-',
        });
    });

    lines.push({ kind: 'separator' });
    title('Pagamento');
    lines.push({
        kind: 'text',
        text: translatePaymentMethod(sale.payment_method),
    });
    lines.push({ kind: 'text', text: `Status: ${translatedStatus}` });

    if (installmentSummary) {
        lines.push({ kind: 'text', text: installmentSummary });
    }

    lines.push({
        kind: 'text',
        text: `Categorias: ${resolveCategorySummary(sale)}`,
    });

    lines.push({ kind: 'separator' });
    title('Resumo');
    lines.push({
        kind: 'pair',
        left: 'Subtotal',
        right: formatCurrencyBR(sale.subtotal),
    });

    if (hasDiscount(sale)) {
        lines.push({
            kind: 'pair',
            left: 'Desconto',
            right: formatDiscount(sale),
        });
    }

    lines.push({
        kind: 'pair',
        left: 'Total',
        right: formatCurrencyBR(sale.total),
        bold: true,
        size: 10.5,
    });
    lines.push({
        kind: 'pair',
        left: 'Pago',
        right: formatCurrencyBR(balance.paid),
    });
    lines.push({
        kind: 'pair',
        left: 'Restante',
        right: formatCurrencyBR(balance.remaining),
    });
    lines.push({ kind: 'text', text: `Status final: ${translatedStatus}` });

    lines.push({ kind: 'separator' });
    lines.push({
        kind: 'text',
        text: 'Obrigado pela preferencia',
        align: 'center',
    });
    lines.push({
        kind: 'text',
        text: `Emitido em ${new Date().toLocaleString('pt-BR')}`,
        align: 'center',
    });

    const setFont = (doc: jsPDF, bold?: boolean, size?: number) => {
        doc.setFont('courier', bold ? 'bold' : 'normal');
        doc.setFontSize(size ?? 8.5);
    };

    // Lays the lines out once to measure the page height, then again to draw them.
    const layout = (doc: jsPDF, draw: boolean): number => {
        let y = margin + 3;

        lines.forEach((line) => {
            if (line.kind === 'gap') {
                y += line.height;

                return;
            }

            if (line.kind === 'separator') {
                if (draw) {
                    doc.setLineDashPattern([0.8, 0.8], 0);
                    doc.setDrawColor(0, 0, 0);
                    doc.line(margin, y - 1, pageWidth - margin, y - 1);
                    doc.setLineDashPattern([], 0);
                }

                y += 2.5;

                return;
            }

            setFont(doc, line.bold, line.size);
            const height = lineHeight * ((line.size ?? 8.5) / 8.5);

            if (line.kind === 'text') {
                const wrapped: string[] = doc.splitTextToSize(
                    line.text,
                    contentWidth,
                );

                wrapped.forEach((text) => {
                    if (draw) {
                        doc.text(
                            text,
                            line.align === 'center' ? pageWidth / 2 : margin,
                            y,
                            { align: line.align ?? 'left' },
                        );
                    }

                    y += height;
                });

                return;
            }

            const rightWidth = doc.getTextWidth(line.right);
            const wrapped: string[] = doc.splitTextToSize(
                line.left,
                Math.max(10, contentWidth - rightWidth - 2),
            );

            wrapped.forEach((text, index) => {
                if (draw) {
                    doc.text(text, margin, y);

                    if (index === 0) {
                        doc.text(line.right, pageWidth - margin, y, {
                            align: 'right',
                        });
                    }
                }

                y += height;
            });
        });

        return y + margin;
    };

    const height = Math.max(
        60,
        layout(new jsPDF({ unit: 'mm', format: [pageWidth, 1000] }), false),
    );
    const doc = new jsPDF({ unit: 'mm', format: [pageWidth, height] });

    doc.setTextColor(0, 0, 0);
    layout(doc, true);
    doc.save(buildInvoiceFileName(sale, '-80mm'));
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
