import { router } from '@inertiajs/react';
import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { createElement, useState } from 'react';
import type { HistoryTimelineItem } from '@/components/history-timeline';
import type { ServerColumn } from '@/components/table/server-table';
import { withAppBasePath } from '@/constants/workspace';
import { customersQueryKey } from '@/hooks/use-customers';
import { productsQueryKey } from '@/hooks/use-products';
import type { SaleMutationInput } from '@/hooks/use-sales';
import { receivablesQueryKey, salesQueryKey } from '@/hooks/use-sales';
import { formatDateTimeManaus } from '@/lib/format';
import type { AccountReceivable } from '@/schemas/accountReceivable';
import type { Customer } from '@/schemas/customer';
import type { Product } from '@/schemas/product';
import type { Sale } from '@/schemas/sale';
import { toNumber } from '@/services/normalizers';
import { saleService } from '@/services/sales';
import type { BreadcrumbItem, ServerValidationError } from '@/types';
import type {
    UiCustomer,
    UiPaymentMethod,
    UiProduct,
} from '@/types/dashboard-entities';
import type { SalesLineItem } from '@/types/sales-dialog';
import {
    formatCurrencyInput,
    formatPercentInput,
    parseCurrencyInput,
    parsePercentInput,
} from '@/utils/form-fields';
import { calculateSaleProfit } from '@/utils/sale-profit';
import { todayString } from '@/utils/sales-dialog';
import { NamesCell } from '../components/names-cell';
import {
    BRAND_EXPORT_COLUMN,
    CATEGORY_EXPORT_COLUMN,
    CREDIARIO_DAYS_PER_INSTALLMENT,
    CUSTOMER_COLUMN,
    DATE_COLUMN,
    HISTORY_EVENTS,
    INSTALLMENTS_COLUMN,
    NO_DISCOUNT,
    PAYMENT_METHOD_COLUMN,
    PRODUCT_COLUMN,
    PRODUCT_EXPORT_COLUMN,
    PROFIT_COLUMN,
    SALES_BREADCRUMB,
    SALES_LIST_URL,
    STATUS_COLUMN,
    STATUS_EXPORT_COLUMN,
    TOTAL_COLUMN,
} from './constants';
import { makeCrediarioEntrySchema } from './schemas';
import type {
    ApiParams,
    ApiPaymentMethod,
    AppliedDiscount,
    CardType,
    NewClientData,
    SaleDiscountType,
    SaleDraft,
    SaleFormInitial,
    SaleFormState,
    SaleRow,
    SaleStatus,
    SalesFilterOptions,
    SalesTotals,
} from './types';

export function saleDetailsUrl(id: number): string {
    return withAppBasePath(`/dashboard/sales/${id}`);
}

export function getShowBreadcrumbs(saleId: number): BreadcrumbItem[] {
    return [
        SALES_BREADCRUMB,
        { title: 'Detalhes da venda', href: `/dashboard/sales/${saleId}` },
    ];
}

// Remembers the filtered list so "Voltar" returns to it.
let lastSalesListUrl: string | null = null;

export function openSaleDetails(id: number): void {
    lastSalesListUrl = window.location.href;
    router.visit(saleDetailsUrl(id));
}

export function goBackToSales(): void {
    router.visit(lastSalesListUrl ?? SALES_LIST_URL);
}

function withoutPagination(apiParams: ApiParams): ApiParams {
    return Object.fromEntries(
        Object.entries(apiParams).filter(
            ([key]) => !['page', 'per_page', 'sort', 'direction'].includes(key),
        ),
    );
}

export function useSalesPage(apiParams: ApiParams) {
    return useQuery({
        queryKey: [...salesQueryKey, 'page', apiParams],
        queryFn: () => saleService.list(apiParams),
        placeholderData: keepPreviousData,
    });
}

export async function fetchAllSales(apiParams: ApiParams): Promise<Sale[]> {
    const filters = Object.fromEntries(
        Object.entries(apiParams).filter(
            ([key]) => key !== 'page' && key !== 'per_page',
        ),
    );
    const response = await saleService.list({ ...filters, per_page: 100 });

    return response.data;
}

// The cards follow the table filters, over every page.
export function useSalesSummary(apiParams: ApiParams) {
    const filters = withoutPagination(apiParams);

    return useQuery({
        queryKey: [...salesQueryKey, 'summary', filters],
        queryFn: async () =>
            (await saleService.list({ ...filters, per_page: 100 })).data,
        placeholderData: keepPreviousData,
    });
}

export function useSale(id: number) {
    return useQuery({
        queryKey: [...salesQueryKey, 'detail', id],
        queryFn: () => saleService.get(id),
        retry: false,
    });
}

export function useCancelSale() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => saleService.cancel(id),
        onSuccess: async () => {
            await Promise.all(
                [
                    salesQueryKey,
                    receivablesQueryKey,
                    productsQueryKey,
                    customersQueryKey,
                ].map((queryKey) =>
                    queryClient.invalidateQueries({ queryKey }),
                ),
            );
        },
    });
}

function uniqueNames(values: Array<string | null | undefined>): string[] {
    return Array.from(
        new Set(
            values
                .map((value) => value?.trim() ?? '')
                .filter((value) => value !== ''),
        ),
    );
}

export function getSaleProfit(sale: Sale): number {
    if (typeof sale.profit === 'number') {
        return sale.profit;
    }

    return calculateSaleProfit(sale) - toNumber(sale.discount);
}

export function toSaleRow(sale: Sale): SaleRow {
    const items = sale.items ?? [];
    const productNames = uniqueNames(items.map((item) => item.product_name));
    const categoryNames = uniqueNames(items.map((item) => item.category_name));
    const brandNames = uniqueNames(items.map((item) => item.brand_name));

    return {
        id: String(sale.id),
        sale,
        date: sale.date,
        customerName: sale.customer_name?.trim() || 'Sem cliente',
        productNames,
        categoryNames,
        brandNames,
        productList: productNames.join(', ') || '-',
        categoryList: categoryNames.join(', ') || '-',
        brandList: brandNames.join(', ') || '-',
        total: sale.total,
        profit: getSaleProfit(sale),
        status: sale.status,
        paymentMethod: sale.payment_method,
        installments: sale.installments ?? 1,
    };
}

function categoryColumn(options: SalesFilterOptions): ServerColumn<SaleRow> {
    return {
        key: 'categoryNames',
        header: 'Categoria',
        render: (row) => createElement(NamesCell, { names: row.categoryNames }),
        filter: {
            type: 'search-select',
            key: 'category_id',
            options: options.categories,
        },
    };
}

function brandColumn(options: SalesFilterOptions): ServerColumn<SaleRow> {
    return {
        key: 'brandNames',
        header: 'Marca',
        render: (row) => createElement(NamesCell, { names: row.brandNames }),
        filter: {
            type: 'search-select',
            key: 'brand_id',
            options: options.brands,
        },
    };
}

export function getTableColumns(
    options: SalesFilterOptions,
): ServerColumn<SaleRow>[] {
    return [
        DATE_COLUMN,
        CUSTOMER_COLUMN,
        PRODUCT_COLUMN,
        categoryColumn(options),
        brandColumn(options),
        TOTAL_COLUMN,
        PROFIT_COLUMN,
        STATUS_COLUMN,
        PAYMENT_METHOD_COLUMN,
        INSTALLMENTS_COLUMN,
    ];
}

export function getExportColumns(): ServerColumn<SaleRow>[] {
    return [
        DATE_COLUMN,
        CUSTOMER_COLUMN,
        PRODUCT_EXPORT_COLUMN,
        CATEGORY_EXPORT_COLUMN,
        BRAND_EXPORT_COLUMN,
        TOTAL_COLUMN,
        PROFIT_COLUMN,
        STATUS_EXPORT_COLUMN,
        PAYMENT_METHOD_COLUMN,
        INSTALLMENTS_COLUMN,
    ];
}

export function getSalesTotals(sales: Sale[]): SalesTotals {
    const active = sales.filter((sale) => sale.status !== 'cancelled');

    return {
        count: active.length,
        total: active.reduce((sum, sale) => sum + sale.total, 0),
        profit: active.reduce((sum, sale) => sum + getSaleProfit(sale), 0),
        receivable: active
            .filter((sale) => sale.status === 'pending')
            .reduce(
                (sum, sale) =>
                    sum + sale.total - toNumber(sale.crediario_entry),
                0,
            ),
    };
}

export function getSaleReceivables(
    receivables: AccountReceivable[],
    saleId: number,
): AccountReceivable[] {
    return receivables
        .filter((receivable) => receivable.sale_id === saleId)
        .sort(
            (a, b) => (a.installment_number ?? 0) - (b.installment_number ?? 0),
        );
}

export function getPaidInstallments(
    receivables: AccountReceivable[],
): number[] {
    return receivables
        .filter(
            (receivable) =>
                receivable.status === 'received' &&
                receivable.installment_number !== null,
        )
        .map((receivable) => receivable.installment_number as number);
}

function isOpenReceivable(receivable: AccountReceivable): boolean {
    return (
        receivable.status !== 'received' && receivable.status !== 'cancelled'
    );
}

// On edit the sale's own open installments do not count against the limit.
export function getOwnOpenBalance(receivables: AccountReceivable[]): number {
    return receivables
        .filter(isOpenReceivable)
        .reduce((sum, receivable) => sum + toNumber(receivable.amount), 0);
}

export function toHistoryItems(sale: Sale): HistoryTimelineItem[] {
    return (sale.history ?? []).map((entry, index) => {
        const event = HISTORY_EVENTS[entry.type] ?? HISTORY_EVENTS.updated;

        return {
            id: `${entry.type}-${index}`,
            title: event.title,
            icon: event.icon,
            tone: event.tone,
            description: entry.description,
            date: entry.occurred_at,
            amount: entry.amount,
        };
    });
}

export function toUiCustomer(
    customer: Customer,
    ownOpenBalance = 0,
): UiCustomer {
    const limit = toNumber(customer.credit_limit);
    const openBalance = toNumber(customer.open_balance) - ownOpenBalance;

    return {
        id: String(customer.id),
        name: customer.name,
        email: customer.email ?? '',
        phone: customer.phone ?? '',
        document: customer.document ?? '',
        city: '',
        state: '',
        address: '',
        createdAt: customer.createdAt ?? '',
        creditEnabled: Boolean(customer.credit_enabled),
        creditLimit: limit,
        creditTermDays: toNumber(customer.credit_term_days) || 30,
        availableCredit: customer.credit_enabled
            ? Math.max(0, limit - Math.max(0, openBalance))
            : 0,
    };
}

export function toUiProduct(product: Product): UiProduct {
    return {
        id: String(product.id),
        name: product.name,
        sku: product.sku,
        barcode: product.barcode ?? undefined,
        category: String(product.category_id ?? ''),
        brand: String(product.brand_id ?? ''),
        price: toNumber(product.sale_price),
        cost: toNumber(product.cost),
        stock: toNumber(product.stock),
        minStock: toNumber(product.min_stock),
        createdAt: '',
    };
}

export function toUiPaymentMethod(method: string): UiPaymentMethod {
    if (method === 'cash') {
        return 'money';
    }

    if (method === 'card_debit' || method === 'card_credit') {
        return 'card';
    }

    return method === 'crediario' ? 'crediario' : 'pix';
}

export function toApiPaymentMethod(
    method: UiPaymentMethod,
    cardType: CardType,
): ApiPaymentMethod {
    if (method === 'money') {
        return 'cash';
    }

    if (method === 'card') {
        return cardType === 'credit' ? 'card_credit' : 'card_debit';
    }

    return method;
}

export function toMoneyInput(value: number): string {
    return value > 0
        ? formatCurrencyInput(String(Math.round(value * 100)))
        : '';
}

export function toSaleFormInitial(sale?: Sale | null): SaleFormInitial {
    if (!sale) {
        return {
            clientId: '',
            lineItems: [],
            date: todayString(),
            paymentMethod: 'pix',
            cardType: 'debit',
            installments: '1',
            crediarioEntry: '',
            discount: NO_DISCOUNT,
        };
    }

    const discount = toNumber(sale.discount);

    return {
        clientId: sale.customer_id ? String(sale.customer_id) : '',
        lineItems: (sale.items ?? []).map((item) => ({
            id: crypto.randomUUID(),
            productId: String(item.product_id),
            productName: item.product_name ?? `#${item.product_id}`,
            sku: '',
            quantity: item.quantity,
            unitPrice: item.unit_price,
            unitCost: item.unit_cost,
            subtotal: item.subtotal,
        })),
        date: sale.date,
        paymentMethod: toUiPaymentMethod(sale.payment_method),
        cardType: sale.payment_method === 'card_credit' ? 'credit' : 'debit',
        installments: String(sale.installments ?? 1),
        crediarioEntry: toMoneyInput(toNumber(sale.crediario_entry)),
        discount:
            discount > 0 ? { type: 'amount', value: discount } : NO_DISCOUNT,
    };
}

function roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
}

export function calculateCartTotal(items: SalesLineItem[]): number {
    return roundMoney(items.reduce((sum, item) => sum + item.subtotal, 0));
}

export function calculateDiscountAmount(
    subtotal: number,
    discount: AppliedDiscount,
): number {
    if (subtotal <= 0 || discount.value <= 0) {
        return 0;
    }

    const amount =
        discount.type === 'percent'
            ? (subtotal * Math.min(100, discount.value)) / 100
            : discount.value;

    return roundMoney(Math.min(subtotal, amount));
}

export function calculateItemsProfit(items: SalesLineItem[]): number {
    return roundMoney(
        items.reduce(
            (sum, item) =>
                sum + (item.unitPrice - item.unitCost) * item.quantity,
            0,
        ),
    );
}

export function filterProductsByQuery(
    products: UiProduct[],
    query: string,
): UiProduct[] {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return products;
    }

    return products.filter(
        (product) =>
            product.name.toLowerCase().includes(normalizedQuery) ||
            product.sku.toLowerCase().includes(normalizedQuery) ||
            (product.barcode ?? '').toLowerCase().includes(normalizedQuery),
    );
}

function withQuantity(item: SalesLineItem, quantity: number): SalesLineItem {
    return {
        ...item,
        quantity,
        subtotal: roundMoney(item.unitPrice * quantity),
    };
}

export function useSaleForm(
    initial: SaleFormInitial,
    clients: UiCustomer[],
): SaleFormState {
    const [clientId, setClientId] = useState(initial.clientId);
    const [lineItems, setLineItems] = useState(initial.lineItems);
    const [productSearch, setProductSearch] = useState('');
    const [isScannerReady, setIsScannerReady] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(initial.paymentMethod);
    const [cardType, setCardType] = useState(initial.cardType);
    const [installments, setInstallments] = useState(initial.installments);
    const [crediarioEntry, setCrediarioEntry] = useState(
        initial.crediarioEntry,
    );
    const [firstInstallmentDate, setFirstInstallmentDate] = useState(
        initial.date,
    );
    const [saleDate, setSaleDate] = useState(initial.date);
    const [notes, setNotes] = useState('');
    const [discount, setDiscount] = useState(initial.discount);

    const selectedClient = clients.find((client) => client.id === clientId);
    const subtotal = calculateCartTotal(lineItems);
    const discountAmount = calculateDiscountAmount(subtotal, discount);
    const total = roundMoney(subtotal - discountAmount);

    const entry = parseCurrencyInput(crediarioEntry);
    const maxInstallments = Math.max(
        1,
        Math.floor(
            (selectedClient?.creditTermDays ?? CREDIARIO_DAYS_PER_INSTALLMENT) /
                CREDIARIO_DAYS_PER_INSTALLMENT,
        ),
    );
    const effectiveInstallments = Math.min(
        maxInstallments,
        Math.max(1, Number(installments) || 1),
    );
    const financed = roundMoney(Math.max(0, total - entry));
    const availableCredit = selectedClient?.availableCredit ?? 0;
    const creditEnabled = Boolean(selectedClient?.creditEnabled);
    const entryCheck = makeCrediarioEntrySchema(total).safeParse(entry);
    const crediario = {
        entry,
        financed,
        installments: effectiveInstallments,
        installmentValue: roundMoney(financed / effectiveInstallments),
        maxInstallments,
        availableCredit,
        creditEnabled,
        exceeded: financed > availableCredit + 0.001,
        entryError: entryCheck.success
            ? null
            : (entryCheck.error.issues[0]?.message ?? null),
    };
    const isCrediarioValid =
        paymentMethod !== 'crediario' ||
        (creditEnabled && !crediario.exceeded && !crediario.entryError);

    const addProduct = (
        product: UiProduct,
        quantity: number,
        price: number,
    ) => {
        const safeQuantity = Math.max(1, Number(quantity) || 1);
        const safePrice = Math.max(0, Number(price) || 0);

        setLineItems((items) => {
            const existing = items.find(
                (item) =>
                    item.productId === product.id &&
                    item.unitPrice === safePrice,
            );

            if (existing) {
                return items.map((item) =>
                    item === existing
                        ? withQuantity(item, item.quantity + safeQuantity)
                        : item,
                );
            }

            return [
                ...items,
                {
                    id: crypto.randomUUID(),
                    productId: product.id,
                    productName: product.name,
                    sku: product.sku,
                    quantity: safeQuantity,
                    unitPrice: safePrice,
                    unitCost: product.cost,
                    subtotal: roundMoney(safePrice * safeQuantity),
                },
            ];
        });
    };

    const changeQuantity = (itemId: string, delta: number) =>
        setLineItems((items) =>
            items.flatMap((item) => {
                if (item.id !== itemId) {
                    return [item];
                }

                const quantity = item.quantity + delta;

                return quantity > 0 ? [withQuantity(item, quantity)] : [];
            }),
        );

    return {
        clientId,
        setClientId,
        selectedClient,
        lineItems,
        addProduct,
        increaseQuantity: (itemId) => changeQuantity(itemId, 1),
        decreaseQuantity: (itemId) => changeQuantity(itemId, -1),
        removeItem: (itemId) =>
            setLineItems((items) => items.filter((item) => item.id !== itemId)),
        productSearch,
        setProductSearch,
        isScannerReady,
        toggleScanner: () => setIsScannerReady((current) => !current),
        paymentMethod,
        setPaymentMethod,
        cardType,
        setCardType,
        installments,
        setInstallments,
        crediarioEntry,
        setCrediarioEntry,
        firstInstallmentDate,
        setFirstInstallmentDate,
        saleDate,
        setSaleDate,
        notes,
        setNotes,
        discount,
        setDiscount,
        subtotal,
        discountAmount,
        total,
        crediario,
        canSubmit:
            Boolean(selectedClient) && lineItems.length > 0 && isCrediarioValid,
    };
}

export function buildSaleDraft(
    form: SaleFormState,
    options: {
        saleId?: number;
        saleStatus?: SaleStatus;
        paidInstallments: number[];
    },
): SaleDraft {
    const isCrediario = form.paymentMethod === 'crediario';
    const isCardCredit =
        form.paymentMethod === 'card' && form.cardType === 'credit';
    const installments = isCrediario ? form.crediario.installments : 1;

    return {
        saleId: options.saleId,
        clientId: form.clientId,
        clientName: form.selectedClient?.name ?? '',
        date: form.saleDate,
        lineItems: form.lineItems,
        paymentMethod: form.paymentMethod,
        cardType: form.cardType,
        subtotal: form.subtotal,
        discount: form.discountAmount,
        total: form.total,
        installments,
        firstInstallmentDate:
            isCrediario || isCardCredit ? form.firstInstallmentDate : undefined,
        installmentValue: isCrediario
            ? form.crediario.installmentValue
            : undefined,
        crediarioEntry: isCrediario ? form.crediario.entry : undefined,
        paidInstallments: isCrediario
            ? options.paidInstallments.filter(
                  (number) => number <= installments,
              )
            : [],
        status: options.saleStatus === 'completed' ? 'completed' : 'pending',
    };
}

export function toSaleMutationInput(draft: SaleDraft): SaleMutationInput {
    const paymentMethod = toApiPaymentMethod(
        draft.paymentMethod,
        draft.cardType,
    );
    const isCrediario = paymentMethod === 'crediario';
    const usesInstallments = isCrediario || paymentMethod === 'card_credit';
    const isAllPaid =
        isCrediario && draft.paidInstallments.length >= draft.installments;

    return {
        customer_id: Number(draft.clientId),
        date: draft.date || todayString(),
        status: isAllPaid ? 'completed' : draft.status,
        payment_method: paymentMethod,
        discount: draft.discount,
        installments: usesInstallments ? draft.installments : undefined,
        first_installment_date: usesInstallments
            ? draft.firstInstallmentDate
            : undefined,
        installment_value: isCrediario ? draft.installmentValue : undefined,
        crediario_entry: isCrediario ? draft.crediarioEntry : undefined,
        paid_installments: isCrediario ? draft.paidInstallments : undefined,
        items: draft.lineItems.map((item) => ({
            product_id: Number(item.productId),
            quantity: Number(item.quantity),
            unit_price: Number(item.unitPrice),
        })),
    };
}

export function toPreviewSale(draft: SaleDraft): Sale {
    return {
        id: draft.saleId ?? 0,
        customer_id: draft.clientId ? Number(draft.clientId) : null,
        customer_name: draft.clientName,
        date: draft.date || todayString(),
        subtotal: draft.subtotal,
        discount: draft.discount,
        total: draft.total,
        status: draft.status,
        payment_method: toApiPaymentMethod(draft.paymentMethod, draft.cardType),
        installments: draft.installments,
        installment_value: draft.installmentValue ?? null,
        crediario_entry: draft.crediarioEntry ?? null,
        first_installment_date: draft.firstInstallmentDate ?? null,
        items: draft.lineItems.map((item, index) => ({
            id: index + 1,
            product_id: Number(item.productId) || 0,
            product_name: item.productName,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            unit_cost: item.unitCost,
            subtotal: item.subtotal,
        })),
    };
}

export function isStockError(error: unknown): boolean {
    const stock = (error as ServerValidationError | null)?.errors?.stock;

    return Array.isArray(stock) && stock.length > 0;
}

export function getErrorMessage(error: unknown, fallback: string): string {
    const { message, errors } = (error ?? {}) as ServerValidationError;
    const firstFieldError = Object.values(errors ?? {})[0]?.[0];

    return firstFieldError || message || fallback;
}

export function formatOptionalDateTime(value?: string | null): string {
    return value ? formatDateTimeManaus(value) : '-';
}

export function getInstallmentLabel(
    receivable: AccountReceivable,
    installmentsCount: number,
): string {
    if (receivable.installment_number === null) {
        return 'Entrada';
    }

    return `${receivable.installment_number}/${receivable.total_installments ?? installmentsCount}`;
}

export function isUiPaymentMethod(value: string): value is UiPaymentMethod {
    return ['money', 'pix', 'card', 'crediario'].includes(value);
}

export function parseLocalDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, (month || 1) - 1, day || 1);
}

export function toDiscountInput(discount: AppliedDiscount): string {
    if (discount.value <= 0) {
        return '';
    }

    const digits = String(Math.round(discount.value * 100));

    return discount.type === 'percent'
        ? formatPercentInput(digits)
        : formatCurrencyInput(digits);
}

export function parseDiscountInput(
    type: SaleDiscountType,
    value: string,
): number {
    return type === 'percent'
        ? parsePercentInput(value)
        : parseCurrencyInput(value);
}

export function toNewClientData(name: string): NewClientData {
    return {
        name,
        email: '',
        phone: '',
        document: '',
        personType: 'pf',
        creditEnabled: false,
        creditLimit: 0,
        creditTermDays: 30,
        status: 'active',
    };
}
