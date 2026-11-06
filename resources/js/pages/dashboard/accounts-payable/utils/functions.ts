import { router } from '@inertiajs/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import type { ServerColumn } from '@/components/table/server-table';
import { withAppBasePath } from '@/constants/workspace';
import {
    accountPayablesQueryKey,
    usePartialSettleAccountPayable,
    useSettleAccountPayable,
    useUnsettleAccountPayable,
} from '@/hooks/use-account-payables';
import { todayInAppTimeZone } from '@/lib/app-timezone';
import { formatDateBR, formatDateTimeManaus } from '@/lib/format';
import type { AccountPayable } from '@/schemas/accountPayable';
import { accountPayableService } from '@/services/account-payables';
import { toNumber } from '@/services/normalizers';
import type { BreadcrumbItem, ServerValidationError } from '@/types';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/form-fields';
import { addMonthsKeepingDay } from '@/utils/manual-boletos';
import {
    AMOUNT_COLUMN,
    DEFAULT_PAID_METHOD,
    SUPPLIER_COLUMN,
    DESCRIPTION_COLUMN,
    DUE_DATE_COLUMN,
    ENTRY_DATE_COLUMN,
    INSTALLMENT_COLUMN,
    ORIGIN_COLUMN,
    ORIGIN_EXPORT_COLUMN,
    PAYABLE_MESSAGES,
    PAYABLES_BREADCRUMB,
    PAYABLES_LIST_URL,
    STATUS_COLUMN,
    STATUS_EXPORT_COLUMN,
} from './constants';
import type {
    ApiParams,
    BoletoTerm,
    PayableFormValues,
    PayableRow,
    PayablesTotals,
    PayableSubmitData,
} from './types';

export function payableDetailsUrl(id: number): string {
    return withAppBasePath(`/dashboard/accounts-payable/${id}`);
}

export function getShowBreadcrumbs(payableId: number): BreadcrumbItem[] {
    return [
        PAYABLES_BREADCRUMB,
        {
            title: 'Detalhes da conta',
            href: `/dashboard/accounts-payable/${payableId}`,
        },
    ];
}

// Remembers the filtered list so "Voltar" returns to it.
let lastListUrl: string | null = null;

export function openPayableDetails(id: number): void {
    lastListUrl = window.location.href;
    router.visit(payableDetailsUrl(id));
}

export function goBackToPayables(): void {
    router.visit(lastListUrl ?? PAYABLES_LIST_URL);
}

function withoutPagination(apiParams: ApiParams): ApiParams {
    return Object.fromEntries(
        Object.entries(apiParams).filter(
            ([key]) => !['page', 'per_page', 'sort', 'direction'].includes(key),
        ),
    );
}

export function usePayablesPage(apiParams: ApiParams) {
    return useQuery({
        queryKey: [...accountPayablesQueryKey, 'page', apiParams],
        queryFn: () => accountPayableService.list(apiParams),
        placeholderData: keepPreviousData,
    });
}

export async function fetchAllPayables(
    apiParams: ApiParams,
): Promise<AccountPayable[]> {
    const response = await accountPayableService.list({
        ...withoutPagination(apiParams),
        sort: apiParams.sort,
        direction: apiParams.direction,
        per_page: 100,
    });

    return response.data;
}

// The cards follow the table filters, over every page.
export function usePayablesSummary(apiParams: ApiParams) {
    const filters = withoutPagination(apiParams);

    return useQuery({
        queryKey: [...accountPayablesQueryKey, 'summary', filters],
        queryFn: async () =>
            (await accountPayableService.list({ ...filters, per_page: 100 }))
                .data,
        placeholderData: keepPreviousData,
    });
}

export function usePayable(id: number) {
    return useQuery({
        queryKey: [...accountPayablesQueryKey, 'detail', id],
        queryFn: () => accountPayableService.get(id),
        retry: false,
    });
}

// Sale installments read "1/3", the crediário entry "Entrada", a manual record "Única".
export function getInstallmentLabel(payable: AccountPayable): string {
    if (payable.installment_number === null) {
        return 'Única';
    }

    const total = payable.total_installments ?? 0;

    return total > 1 ? `${payable.installment_number}/${total}` : 'Única';
}

export function getOriginLabel(payable: AccountPayable): string {
    return payable.purchase_id ? `Compra #${payable.purchase_id}` : 'Manual';
}

export function isOpenStatus(status: string): boolean {
    return status === 'pending' || status === 'partial';
}

export function toPayableRow(payable: AccountPayable): PayableRow {
    return {
        id: String(payable.id),
        payable,
        supplierName: payable.supplier_name?.trim() || 'Sem fornecedor',
        description: payable.item?.trim() || '-',
        installment: getInstallmentLabel(payable),
        origin: getOriginLabel(payable),
        amount: toNumber(payable.total_amount),
        remaining: toNumber(payable.remaining_balance),
        status: payable.status,
        dueDate: payable.due_date,
        entryDate: payable.entry_date,
    };
}

export function getTableColumns(): ServerColumn<PayableRow>[] {
    return [
        ENTRY_DATE_COLUMN,
        DUE_DATE_COLUMN,
        SUPPLIER_COLUMN,
        DESCRIPTION_COLUMN,
        INSTALLMENT_COLUMN,
        ORIGIN_COLUMN,
        AMOUNT_COLUMN,
        STATUS_COLUMN,
    ];
}

export function getExportColumns(): ServerColumn<PayableRow>[] {
    return [
        ENTRY_DATE_COLUMN,
        DUE_DATE_COLUMN,
        SUPPLIER_COLUMN,
        DESCRIPTION_COLUMN,
        INSTALLMENT_COLUMN,
        ORIGIN_EXPORT_COLUMN,
        AMOUNT_COLUMN,
        STATUS_EXPORT_COLUMN,
    ];
}

export function getPayablesTotals(payables: AccountPayable[]): PayablesTotals {
    const active = payables.filter((payable) => payable.status !== 'cancelled');

    return {
        count: payables.length,
        open: active
            .filter((payable) => isOpenStatus(payable.status))
            .reduce(
                (sum, payable) => sum + toNumber(payable.remaining_balance),
                0,
            ),
        // Partial payments count as paid too.
        settled: active.reduce(
            (sum, payable) => sum + toNumber(payable.amount_paid),
            0,
        ),
    };
}

// Receipts settled with a date only are stored at midnight UTC.
export function formatSettledAt(value?: string | null): string {
    if (!value) {
        return '-';
    }

    return /T00:00:00(\.0+)?(Z|\+00:00)$/.test(value) ||
        /^\d{4}-\d{2}-\d{2}( 00:00:00)?$/.test(value)
        ? formatDateBR(value.slice(0, 10))
        : formatDateTimeManaus(value);
}

export function getErrorMessage(error: unknown, fallback: string): string {
    const { message, errors } = (error ?? {}) as ServerValidationError;
    const firstFieldError = Object.values(errors ?? {})[0]?.[0];

    return firstFieldError || message || fallback;
}

export function toPayableFormValues(
    payable?: AccountPayable | null,
): PayableFormValues {
    const today = todayInAppTimeZone();

    if (!payable) {
        return {
            supplier_id: '',
            item: '',
            amount: '',
            entry_date: today,
            due_date: today,
            payment_method: 'pix',
            boleto_term_days: '30',
            status: 'pending',
            description: '',
        };
    }

    const amount = toNumber(payable.total_amount);

    return {
        supplier_id: payable.supplier_id ? String(payable.supplier_id) : '',
        item: payable.item ?? '',
        amount:
            amount > 0
                ? formatCurrencyInput(String(Math.round(amount * 100)))
                : '',
        entry_date: payable.entry_date ?? today,
        due_date: payable.due_date ?? today,
        payment_method: 'pix',
        boleto_term_days: '30',
        status: payable.status === 'paid' ? 'paid' : 'pending',
        description: payable.description ?? '',
    };
}

export function toPayableSubmitData(
    values: PayableFormValues,
): PayableSubmitData {
    const isBoleto = values.payment_method === 'boleto';
    const term = Number(values.boleto_term_days) as BoletoTerm;

    return {
        supplier_id: Number(values.supplier_id),
        item: values.item.trim(),
        description: values.description.trim() || undefined,
        amount: parseCurrencyInput(values.amount),
        entry_date: values.entry_date,
        // A boleto account is due on its last boleto (the API splits it month by month).
        due_date: isBoleto
            ? addMonthsKeepingDay(values.entry_date, Math.ceil(term / 30))
            : values.due_date,
        payment_method: values.payment_method,
        status: values.status,
        boleto_term_days: isBoleto ? term : undefined,
    };
}

async function runForEach(
    ids: number[],
    action: (id: number) => Promise<unknown>,
    success: (count: number) => string,
): Promise<boolean> {
    const results = await Promise.allSettled(ids.map(action));
    const failed = results.filter(
        (result) => result.status === 'rejected',
    ).length;

    if (failed > 0) {
        toast.error(PAYABLE_MESSAGES.partialFailures(failed, ids.length));

        return false;
    }

    toast.success(success(ids.length));

    return true;
}

// Full receipt, partial receipt and undo, for one or many accounts at once.
export function usePaymentActions() {
    const settle = useSettleAccountPayable();
    const unsettle = useUnsettleAccountPayable();
    const partialSettle = usePartialSettleAccountPayable();
    const [isRunning, setIsRunning] = useState(false);

    const run = async (task: () => Promise<boolean>) => {
        setIsRunning(true);

        try {
            return await task();
        } finally {
            setIsRunning(false);
        }
    };

    return {
        isProcessing:
            isRunning ||
            settle.isPending ||
            unsettle.isPending ||
            partialSettle.isPending,
        settle: (ids: number[]) =>
            run(() =>
                runForEach(
                    ids,
                    (id) =>
                        settle.mutateAsync({
                            id,
                            paid_at: todayInAppTimeZone(),
                            paid_method: DEFAULT_PAID_METHOD,
                        }),
                    PAYABLE_MESSAGES.settleSuccess,
                ),
            ),
        undo: (ids: number[]) =>
            run(() =>
                runForEach(
                    ids,
                    (id) => unsettle.mutateAsync(id),
                    PAYABLE_MESSAGES.undoSuccess,
                ),
            ),
        partial: (id: number, amount: number) =>
            run(async () => {
                try {
                    await partialSettle.mutateAsync({
                        id,
                        amount,
                        paid_at: todayInAppTimeZone(),
                        paid_method: DEFAULT_PAID_METHOD,
                    });
                    toast.success(PAYABLE_MESSAGES.partialSuccess);

                    return true;
                } catch (error) {
                    toast.error(
                        getErrorMessage(error, PAYABLE_MESSAGES.partialError),
                    );

                    return false;
                }
            }),
    };
}
