import { router } from '@inertiajs/react';
import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import { createElement, useState } from 'react';
import type { HistoryTimelineItem } from '@/components/history-timeline';
import type { ServerColumn } from '@/components/table/server-table';
import { withAppBasePath } from '@/constants/workspace';
import { productsQueryKey } from '@/hooks/use-products';
import type { PurchaseMutationInput } from '@/hooks/use-purchases';
import { payablesQueryKey, purchasesQueryKey } from '@/hooks/use-purchases';
import { formatDateBR, formatDateTimeManaus } from '@/lib/format';
import type { Product } from '@/schemas/product';
import type { Purchase } from '@/schemas/purchase';
import type { Supplier } from '@/schemas/supplier';
import { toNumber } from '@/services/normalizers';
import { purchaseService } from '@/services/purchases';
import type { BreadcrumbItem, ServerValidationError } from '@/types';
import type { UiProduct } from '@/types/dashboard-entities';
import { formatCurrencyInput } from '@/utils/form-fields';
import { todayString } from '@/utils/sales-dialog';
import { NamesCell } from '../components/names-cell';
import {
    BOLETO_DAYS_PER_INSTALLMENT,
    BOLETO_TERMS,
    BOLETOS_COLUMN,
    BRAND_EXPORT_COLUMN,
    CATEGORY_EXPORT_COLUMN,
    DATE_COLUMN,
    DUE_DATE_COLUMN,
    HISTORY_EVENTS,
    PAYMENT_METHOD_COLUMN,
    PAYMENT_METHOD_LABELS,
    PRODUCT_COLUMN,
    PRODUCT_EXPORT_COLUMN,
    PURCHASES_BREADCRUMB,
    PURCHASES_LIST_URL,
    STATUS_COLUMN,
    STATUS_EXPORT_COLUMN,
    SUPPLIER_COLUMN,
    TOTAL_COLUMN,
    UNKNOWN_HISTORY_EVENT,
} from './constants';
import { notesSchema } from './schemas';
import type {
    ApiParams,
    ApiPaymentMethod,
    BoletoInstallment,
    BoletoOption,
    BoletoTerm,
    HistoryEventConfig,
    PurchaseCartItem,
    PurchaseDraft,
    PurchaseFormInitial,
    PurchaseFormState,
    PurchaseRow,
    PurchasesFilterOptions,
    PurchasesTotals,
    UiPurchasePaymentMethod,
} from './types';

export function purchaseDetailsUrl(id: number): string {
    return withAppBasePath(`/dashboard/purchases/${id}`);
}

export function getShowBreadcrumbs(purchaseId: number): BreadcrumbItem[] {
    return [
        PURCHASES_BREADCRUMB,
        {
            title: 'Detalhes da compra',
            href: `/dashboard/purchases/${purchaseId}`,
        },
    ];
}

// Remembers the filtered list so "Voltar" returns to it.
let lastPurchasesListUrl: string | null = null;

export function openPurchaseDetails(id: number): void {
    lastPurchasesListUrl = window.location.href;
    router.visit(purchaseDetailsUrl(id));
}

export function goBackToPurchases(): void {
    router.visit(lastPurchasesListUrl ?? PURCHASES_LIST_URL);
}

function withoutPagination(apiParams: ApiParams): ApiParams {
    return Object.fromEntries(
        Object.entries(apiParams).filter(
            ([key]) => !['page', 'per_page', 'sort', 'direction'].includes(key),
        ),
    );
}

export function usePurchasesPage(apiParams: ApiParams) {
    return useQuery({
        queryKey: [...purchasesQueryKey, 'page', apiParams],
        queryFn: () => purchaseService.list(apiParams),
        placeholderData: keepPreviousData,
    });
}

export async function fetchAllPurchases(
    apiParams: ApiParams,
): Promise<Purchase[]> {
    const filters = Object.fromEntries(
        Object.entries(apiParams).filter(
            ([key]) => key !== 'page' && key !== 'per_page',
        ),
    );
    const response = await purchaseService.list({
        ...filters,
        per_page: 100,
    });

    return response.data;
}

// The cards follow the table filters, over every page.
export function usePurchasesSummary(apiParams: ApiParams) {
    const filters = withoutPagination(apiParams);

    return useQuery({
        queryKey: [...purchasesQueryKey, 'summary', filters],
        queryFn: async () =>
            (await purchaseService.list({ ...filters, per_page: 100 })).data,
        placeholderData: keepPreviousData,
    });
}

export function usePurchase(id: number) {
    return useQuery({
        queryKey: [...purchasesQueryKey, 'detail', id],
        queryFn: () => purchaseService.get(id),
        retry: false,
    });
}

export function useCancelPurchase() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => purchaseService.cancel(id),
        onSuccess: async () => {
            await Promise.all(
                [purchasesQueryKey, payablesQueryKey, productsQueryKey].map(
                    (queryKey) => queryClient.invalidateQueries({ queryKey }),
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

export function getBoletoCount(term?: number | null): number {
    return term ? Math.ceil(term / BOLETO_DAYS_PER_INSTALLMENT) : 0;
}

export function toPurchaseRow(purchase: Purchase): PurchaseRow {
    const items = purchase.items ?? [];
    const productNames = uniqueNames(items.map((item) => item.product_name));
    const categoryNames = uniqueNames(items.map((item) => item.category_name));
    const brandNames = uniqueNames(items.map((item) => item.brand_name));

    return {
        id: String(purchase.id),
        purchase,
        date: purchase.date,
        dueDate: purchase.due_date,
        supplierName: purchase.supplier_name?.trim() || 'Sem fornecedor',
        productNames,
        categoryNames,
        brandNames,
        productList: productNames.join(', ') || '-',
        categoryList: categoryNames.join(', ') || '-',
        brandList: brandNames.join(', ') || '-',
        total: purchase.total,
        status: purchase.status,
        paymentMethod: purchase.payment_method,
        boletos:
            purchase.payment_method === 'boleto'
                ? getBoletoCount(purchase.boleto_term_days)
                : 0,
    };
}

function categoryColumn(
    options: PurchasesFilterOptions,
): ServerColumn<PurchaseRow> {
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

function brandColumn(
    options: PurchasesFilterOptions,
): ServerColumn<PurchaseRow> {
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

// Dates side by side at the start, then who and what, then values.
export function getTableColumns(
    options: PurchasesFilterOptions,
): ServerColumn<PurchaseRow>[] {
    return [
        DATE_COLUMN,
        DUE_DATE_COLUMN,
        SUPPLIER_COLUMN,
        PRODUCT_COLUMN,
        categoryColumn(options),
        brandColumn(options),
        TOTAL_COLUMN,
        STATUS_COLUMN,
        PAYMENT_METHOD_COLUMN,
        BOLETOS_COLUMN,
    ];
}

export function getExportColumns(): ServerColumn<PurchaseRow>[] {
    return [
        DATE_COLUMN,
        DUE_DATE_COLUMN,
        SUPPLIER_COLUMN,
        PRODUCT_EXPORT_COLUMN,
        CATEGORY_EXPORT_COLUMN,
        BRAND_EXPORT_COLUMN,
        TOTAL_COLUMN,
        STATUS_EXPORT_COLUMN,
        PAYMENT_METHOD_COLUMN,
        BOLETOS_COLUMN,
    ];
}

export function getPurchasesTotals(purchases: Purchase[]): PurchasesTotals {
    const active = purchases.filter(
        (purchase) => purchase.status !== 'cancelled',
    );

    return {
        count: active.length,
        total: active.reduce((sum, purchase) => sum + purchase.total, 0),
        payable: active
            .filter((purchase) => purchase.status === 'pending')
            .reduce((sum, purchase) => sum + purchase.total, 0),
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

export function toUiPaymentMethod(method: string): UiPurchasePaymentMethod {
    if (method === 'cash') {
        return 'money';
    }

    if (method === 'card' || method === 'installment') {
        return 'card';
    }

    return method === 'boleto' ? 'boleto' : 'pix';
}

export function toApiPaymentMethod(
    method: UiPurchasePaymentMethod,
): ApiPaymentMethod {
    return method === 'money' ? 'cash' : method;
}

export function isUiPaymentMethod(
    value: string,
): value is UiPurchasePaymentMethod {
    return ['money', 'pix', 'card', 'boleto'].includes(value);
}

export function isBoletoTerm(value: number): value is BoletoTerm {
    return (BOLETO_TERMS as number[]).includes(value);
}

export function toMoneyInput(value: number): string {
    return value > 0
        ? formatCurrencyInput(String(Math.round(value * 100)))
        : '';
}

export function toPurchaseFormInitial(
    purchase?: Purchase | null,
): PurchaseFormInitial {
    if (!purchase) {
        return {
            supplierId: '',
            lineItems: [],
            date: todayString(),
            paymentMethod: 'pix',
            boletoTerm: 30,
            notes: '',
        };
    }

    const term = Number(purchase.boleto_term_days ?? 30);

    return {
        supplierId: purchase.supplier_id ? String(purchase.supplier_id) : '',
        lineItems: (purchase.items ?? []).map((item) => ({
            id: crypto.randomUUID(),
            productId: String(item.product_id),
            productName: item.product_name ?? `#${item.product_id}`,
            sku: '',
            quantity: item.quantity,
            unitCost: item.unit_cost,
            subtotal: item.subtotal,
        })),
        date: purchase.date,
        paymentMethod: toUiPaymentMethod(purchase.payment_method),
        boletoTerm: isBoletoTerm(term) ? term : 30,
        notes: purchase.notes ?? '',
    };
}

function roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
}

export function calculateCartTotal(items: PurchaseCartItem[]): number {
    return roundMoney(items.reduce((sum, item) => sum + item.subtotal, 0));
}

export function parseLocalDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, (month || 1) - 1, day || 1);
}

export function addDaysToDate(date: string, days: number): string {
    return format(addDays(parseLocalDate(date), days), 'yyyy-MM-dd');
}

// Same split as PayableService: one boleto each 30 days, leftover cents on the first ones.
export function splitBoletos(
    total: number,
    term: BoletoTerm,
    purchaseDate: string,
): BoletoInstallment[] {
    const count = getBoletoCount(term);
    const totalCents = Math.round(total * 100);
    const baseCents = Math.floor(totalCents / count);
    const remainder = totalCents - baseCents * count;

    return Array.from({ length: count }, (_, index) => ({
        number: index + 1,
        dueDate: addDaysToDate(
            purchaseDate,
            BOLETO_DAYS_PER_INSTALLMENT * (index + 1),
        ),
        amount: (baseCents + (index < remainder ? 1 : 0)) / 100,
    }));
}

export function formatShortDate(date: string): string {
    return format(parseLocalDate(date), 'dd/MM/yy');
}

export function getBoletoOptions(purchaseDate: string): BoletoOption[] {
    return BOLETO_TERMS.map((term) => ({
        term,
        count: getBoletoCount(term),
        lastDueDate: addDaysToDate(purchaseDate, term),
    }));
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

function withQuantity(
    item: PurchaseCartItem,
    quantity: number,
): PurchaseCartItem {
    return {
        ...item,
        quantity,
        subtotal: roundMoney(item.unitCost * quantity),
    };
}

export function usePurchaseForm(
    initial: PurchaseFormInitial,
    suppliers: Supplier[],
): PurchaseFormState {
    const [supplierId, setSupplierId] = useState(initial.supplierId);
    const [lineItems, setLineItems] = useState(initial.lineItems);
    const [productSearch, setProductSearch] = useState('');
    const [isScannerReady, setIsScannerReady] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(initial.paymentMethod);
    const [boletoTerm, setBoletoTerm] = useState(initial.boletoTerm);
    const [purchaseDate, setPurchaseDate] = useState(initial.date);
    const [notes, setNotes] = useState(initial.notes);

    const selectedSupplier = suppliers.find(
        (supplier) => String(supplier.id) === supplierId,
    );
    const total = calculateCartTotal(lineItems);
    const notesCheck = notesSchema.safeParse(notes);
    const notesError = notesCheck.success
        ? null
        : (notesCheck.error.issues[0]?.message ?? null);

    const addProduct = (product: UiProduct, quantity: number, cost: number) => {
        const safeQuantity = Math.max(1, Number(quantity) || 1);
        const safeCost = Math.max(0, Number(cost) || 0);

        setLineItems((items) => {
            const existing = items.find(
                (item) =>
                    item.productId === product.id && item.unitCost === safeCost,
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
                    unitCost: safeCost,
                    subtotal: roundMoney(safeCost * safeQuantity),
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
        supplierId,
        setSupplierId,
        selectedSupplier,
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
        boletoTerm,
        setBoletoTerm,
        boletos:
            paymentMethod === 'boleto'
                ? splitBoletos(total, boletoTerm, purchaseDate)
                : [],
        purchaseDate,
        setPurchaseDate,
        notes,
        setNotes,
        notesError,
        total,
        canSubmit:
            Boolean(selectedSupplier) && lineItems.length > 0 && !notesError,
    };
}

// Boletos already paid in contas a pagar, so the edit starts with them marked.
export function getPaidBoletos(purchase?: Purchase | null): number[] {
    return (purchase?.payables ?? [])
        .filter(
            (payable) =>
                payable.status === 'paid' &&
                payable.installment_number !== null,
        )
        .map((payable) => payable.installment_number as number);
}

function resolveDraftStatus(
    form: PurchaseFormState,
    status: PurchaseDraft['status'],
    paidBoletos: number[],
): PurchaseDraft['status'] {
    // Cash is paid on the spot: its payable is created as paid.
    if (form.paymentMethod === 'money') {
        return 'completed';
    }

    if (form.paymentMethod === 'boleto') {
        return paidBoletos.length === form.boletos.length
            ? 'completed'
            : 'pending';
    }

    return status;
}

export function buildPurchaseDraft(
    form: PurchaseFormState,
    options: {
        purchaseId?: number;
        status: PurchaseDraft['status'];
        paidBoletos: number[];
    },
): PurchaseDraft {
    const paidBoletos =
        form.paymentMethod === 'boleto'
            ? options.paidBoletos
                  .filter((number) => number <= form.boletos.length)
                  .sort((a, b) => a - b)
            : [];

    return {
        purchaseId: options.purchaseId,
        supplierId: form.supplierId,
        supplierName: form.selectedSupplier?.name ?? '',
        date: form.purchaseDate,
        lineItems: form.lineItems,
        paymentMethod: form.paymentMethod,
        boletoTerm: form.boletoTerm,
        boletos: form.boletos,
        total: form.total,
        status: resolveDraftStatus(form, options.status, paidBoletos),
        paidBoletos,
        notes: form.notes,
    };
}

export function toPurchaseMutationInput(
    draft: PurchaseDraft,
): PurchaseMutationInput {
    const paymentMethod = toApiPaymentMethod(draft.paymentMethod);

    return {
        supplier_id: Number(draft.supplierId),
        date: draft.date || todayString(),
        status: draft.status,
        payment_method: paymentMethod,
        boleto_term_days:
            paymentMethod === 'boleto' ? draft.boletoTerm : undefined,
        notes: draft.notes.trim() || null,
        paid_installments:
            paymentMethod === 'boleto' ? draft.paidBoletos : undefined,
        items: draft.lineItems.map((item) => ({
            product_id: Number(item.productId),
            quantity: Number(item.quantity),
            unit_cost: Number(item.unitCost),
        })),
    };
}

export function getErrorMessage(error: unknown, fallback: string): string {
    const { message, errors } = (error ?? {}) as ServerValidationError;
    const firstFieldError = Object.values(errors ?? {})[0]?.[0];

    return firstFieldError || message || fallback;
}

// Highest step the buyer can open: each step needs the previous ones complete.
export function getReachableStep(form: PurchaseFormState): number {
    if (form.lineItems.length === 0) {
        return 0;
    }

    if (!form.selectedSupplier) {
        return 1;
    }

    return form.canSubmit ? 3 : 2;
}

export function getPaymentLabel(
    paymentMethod: string,
    boletoTerm?: number | null,
): string {
    const label = PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod;
    const count = getBoletoCount(boletoTerm);

    if (paymentMethod !== 'boleto' || count === 0) {
        return label;
    }

    return count === 1 ? '1 boleto' : `${count} boletos`;
}

export function getDraftPaymentLabel(draft: PurchaseDraft): string {
    return getPaymentLabel(
        toApiPaymentMethod(draft.paymentMethod),
        draft.boletoTerm,
    );
}

export function isOpenPayableStatus(status: string): boolean {
    return status === 'pending' || status === 'partial';
}

// Payments settled on contas a pagar keep only the date (midnight UTC).
export function formatPaidAt(value?: string | null): string {
    if (!value) {
        return '-';
    }

    return /T00:00:00(\.0+)?(Z|\+00:00)$/.test(value)
        ? formatDateBR(value.slice(0, 10))
        : formatDateTimeManaus(value);
}

function getHistoryEvent(type: string): HistoryEventConfig {
    return (
        (HISTORY_EVENTS as Partial<Record<string, HistoryEventConfig>>)[type] ??
        UNKNOWN_HISTORY_EVENT
    );
}

export function toHistoryItems(purchase: Purchase): HistoryTimelineItem[] {
    return (purchase.history ?? []).map((entry, index) => {
        const event = getHistoryEvent(entry.type);

        return {
            id: `${entry.type}-${index}`,
            title: entry.description || event.title,
            icon: event.icon,
            tone: event.tone,
            description: null,
            date: entry.occurred_at,
            amount: entry.amount,
        };
    });
}

export function formatOptionalDateTime(value?: string | null): string {
    return value ? formatDateTimeManaus(value) : '-';
}
