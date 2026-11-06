import { router } from '@inertiajs/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import type { ServerColumn } from '@/components/table/server-table';
import { withAppBasePath } from '@/constants/workspace';
import {
    accountReceivablesQueryKey,
    usePartialSettleAccountReceivable,
    useSettleAccountReceivable,
    useUnsettleAccountReceivable,
} from '@/hooks/use-account-receivables';
import { todayInAppTimeZone } from '@/lib/app-timezone';
import { formatDateBR, formatDateTimeManaus } from '@/lib/format';
import type { AccountReceivable } from '@/schemas/accountReceivable';
import { accountReceivableService } from '@/services/account-receivables';
import { toNumber } from '@/services/normalizers';
import type { BreadcrumbItem, ServerValidationError } from '@/types';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/form-fields';
import { addMonthsKeepingDay } from '@/utils/manual-boletos';
import { splitInstallments } from '@/utils/sale-installments';
import {
    AMOUNT_COLUMN,
    CUSTOMER_COLUMN,
    DESCRIPTION_COLUMN,
    DUE_DATE_COLUMN,
    ENTRY_DATE_COLUMN,
    INSTALLMENT_COLUMN,
    ORIGIN_COLUMN,
    ORIGIN_EXPORT_COLUMN,
    RECEIVABLE_MESSAGES,
    RECEIVABLES_BREADCRUMB,
    RECEIVABLES_LIST_URL,
    STATUS_COLUMN,
    STATUS_EXPORT_COLUMN,
} from './constants';
import type {
    ApiParams,
    CrediarioInstallment,
    NewClientData,
    ReceivableFormValues,
    ReceivableRow,
    ReceivablesTotals,
    ReceivableSubmitData,
} from './types';

export function receivableDetailsUrl(id: number): string {
    return withAppBasePath(`/dashboard/accounts-receivable/${id}`);
}

export function getShowBreadcrumbs(receivableId: number): BreadcrumbItem[] {
    return [
        RECEIVABLES_BREADCRUMB,
        {
            title: 'Detalhes da conta',
            href: `/dashboard/accounts-receivable/${receivableId}`,
        },
    ];
}

// Remembers the filtered list so "Voltar" returns to it.
let lastListUrl: string | null = null;

export function openReceivableDetails(id: number): void {
    lastListUrl = window.location.href;
    router.visit(receivableDetailsUrl(id));
}

export function goBackToReceivables(): void {
    router.visit(lastListUrl ?? RECEIVABLES_LIST_URL);
}

function withoutPagination(apiParams: ApiParams): ApiParams {
    return Object.fromEntries(
        Object.entries(apiParams).filter(
            ([key]) => !['page', 'per_page', 'sort', 'direction'].includes(key),
        ),
    );
}

export function useReceivablesPage(apiParams: ApiParams) {
    return useQuery({
        queryKey: [...accountReceivablesQueryKey, 'page', apiParams],
        queryFn: () => accountReceivableService.list(apiParams),
        placeholderData: keepPreviousData,
    });
}

export async function fetchAllReceivables(
    apiParams: ApiParams,
): Promise<AccountReceivable[]> {
    const response = await accountReceivableService.list({
        ...withoutPagination(apiParams),
        sort: apiParams.sort,
        direction: apiParams.direction,
        per_page: 100,
    });

    return response.data;
}

// The cards follow the table filters, over every page.
export function useReceivablesSummary(apiParams: ApiParams) {
    const filters = withoutPagination(apiParams);

    return useQuery({
        queryKey: [...accountReceivablesQueryKey, 'summary', filters],
        queryFn: async () =>
            (await accountReceivableService.list({ ...filters, per_page: 100 }))
                .data,
        placeholderData: keepPreviousData,
    });
}

export function useReceivable(id: number) {
    return useQuery({
        queryKey: [...accountReceivablesQueryKey, 'detail', id],
        queryFn: () => accountReceivableService.get(id),
        retry: false,
    });
}

// Sale installments read "1/3", the crediário entry "Entrada", a manual record "Única".
export function getInstallmentLabel(receivable: AccountReceivable): string {
    if (receivable.installment_number === null) {
        return receivable.sale_id ? 'Entrada' : 'Única';
    }

    const total = receivable.total_installments ?? 0;

    return total > 1 ? `${receivable.installment_number}/${total}` : 'Única';
}

export function getOriginLabel(receivable: AccountReceivable): string {
    return receivable.sale_id ? `Venda #${receivable.sale_id}` : 'Manual';
}

export function isOpenStatus(status: string): boolean {
    return status === 'pending' || status === 'partial';
}

export function toReceivableRow(receivable: AccountReceivable): ReceivableRow {
    return {
        id: String(receivable.id),
        receivable,
        customerName: receivable.customer_name?.trim() || 'Sem cliente',
        description: receivable.item?.trim() || '-',
        installment: getInstallmentLabel(receivable),
        origin: getOriginLabel(receivable),
        amount: toNumber(receivable.total_amount),
        remaining: toNumber(receivable.remaining_balance),
        status: receivable.status,
        dueDate: receivable.due_date,
        entryDate: receivable.entry_date,
    };
}

export function getTableColumns(): ServerColumn<ReceivableRow>[] {
    return [
        ENTRY_DATE_COLUMN,
        DUE_DATE_COLUMN,
        CUSTOMER_COLUMN,
        DESCRIPTION_COLUMN,
        INSTALLMENT_COLUMN,
        ORIGIN_COLUMN,
        AMOUNT_COLUMN,
        STATUS_COLUMN,
    ];
}

export function getExportColumns(): ServerColumn<ReceivableRow>[] {
    return [
        ENTRY_DATE_COLUMN,
        DUE_DATE_COLUMN,
        CUSTOMER_COLUMN,
        DESCRIPTION_COLUMN,
        INSTALLMENT_COLUMN,
        ORIGIN_EXPORT_COLUMN,
        AMOUNT_COLUMN,
        STATUS_EXPORT_COLUMN,
    ];
}

export function getReceivablesTotals(
    receivables: AccountReceivable[],
): ReceivablesTotals {
    const active = receivables.filter(
        (receivable) => receivable.status !== 'cancelled',
    );

    return {
        count: receivables.length,
        open: active
            .filter((receivable) => isOpenStatus(receivable.status))
            .reduce(
                (sum, receivable) =>
                    sum + toNumber(receivable.remaining_balance),
                0,
            ),
        // Partial payments count as received too.
        settled: active.reduce(
            (sum, receivable) => sum + toNumber(receivable.amount_paid),
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

export function toReceivableFormValues(
    receivable?: AccountReceivable | null,
): ReceivableFormValues {
    const today = todayInAppTimeZone();

    if (!receivable) {
        return {
            customer_id: '',
            item: '',
            amount: '',
            entry_date: today,
            due_date: today,
            payment_method: 'pix',
            card_type: 'debit',
            installments: '1',
            status: 'pending',
            description: '',
        };
    }

    const amount = toNumber(receivable.total_amount);

    return {
        customer_id: receivable.customer_id
            ? String(receivable.customer_id)
            : '',
        item: receivable.item ?? '',
        amount:
            amount > 0
                ? formatCurrencyInput(String(Math.round(amount * 100)))
                : '',
        entry_date: receivable.entry_date ?? today,
        due_date: receivable.due_date ?? receivable.entry_date ?? today,
        payment_method: 'pix',
        card_type: 'debit',
        installments: '1',
        status: receivable.status === 'received' ? 'received' : 'pending',
        description: receivable.description ?? '',
    };
}

export function toReceivableSubmitData(
    values: ReceivableFormValues,
): ReceivableSubmitData {
    const isCrediario = values.payment_method === 'crediario';

    return {
        customer_id: Number(values.customer_id),
        item: values.item.trim(),
        description: values.description.trim() || undefined,
        amount: parseCurrencyInput(values.amount),
        entry_date: values.entry_date,
        due_date: values.due_date,
        payment_method:
            values.payment_method === 'card'
                ? `card_${values.card_type}`
                : values.payment_method,
        // Crediário installments start open, like a sale's.
        status: isCrediario ? 'pending' : values.status,
        installments: isCrediario ? Number(values.installments) : undefined,
    };
}

// Same split as ReceivableService::createManual and a sale: floor in cents, leftover on
// the last installment, due month by month from the first one.
export function splitCrediario(
    total: number,
    installments: number,
    firstDueDate: string,
): CrediarioInstallment[] {
    if (total <= 0 || !firstDueDate) {
        return [];
    }

    return splitInstallments(total, installments).map((amount, index) => ({
        number: index + 1,
        dueDate: addMonthsKeepingDay(firstDueDate, index),
        amount,
    }));
}

export function addDaysToDate(date: string, days: number): string {
    const [year, month, day] = date.split('-').map(Number);
    const target = new Date(year, month - 1, day + days);

    return [
        target.getFullYear(),
        String(target.getMonth() + 1).padStart(2, '0'),
        String(target.getDate()).padStart(2, '0'),
    ].join('-');
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
        toast.error(RECEIVABLE_MESSAGES.partialFailures(failed, ids.length));

        return false;
    }

    toast.success(success(ids.length));

    return true;
}

// Full receipt, partial receipt and undo, for one or many accounts at once.
export function useReceiptActions() {
    const settle = useSettleAccountReceivable();
    const unsettle = useUnsettleAccountReceivable();
    const partialSettle = usePartialSettleAccountReceivable();
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
                            received_at: todayInAppTimeZone(),
                        }),
                    RECEIVABLE_MESSAGES.settleSuccess,
                ),
            ),
        undo: (ids: number[]) =>
            run(() =>
                runForEach(
                    ids,
                    (id) => unsettle.mutateAsync(id),
                    RECEIVABLE_MESSAGES.undoSuccess,
                ),
            ),
        partial: (id: number, amount: number) =>
            run(async () => {
                try {
                    await partialSettle.mutateAsync({
                        id,
                        amount,
                        received_at: todayInAppTimeZone(),
                    });
                    toast.success(RECEIVABLE_MESSAGES.partialSuccess);

                    return true;
                } catch (error) {
                    toast.error(
                        getErrorMessage(
                            error,
                            RECEIVABLE_MESSAGES.partialError,
                        ),
                    );

                    return false;
                }
            }),
    };
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
