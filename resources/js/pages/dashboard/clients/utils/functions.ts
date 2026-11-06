import { router } from '@inertiajs/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { withAppBasePath } from '@/constants/workspace';
import { customersQueryKey } from '@/hooks/use-customers';
import type { Customer } from '@/schemas/customer';
import { customerService } from '@/services/customers';
import { toNumber } from '@/services/normalizers';
import type { BreadcrumbItem } from '@/types';
import {
    formatCurrencyInput,
    formatDocumentDisplay,
    formatPhoneDisplay,
    parseCurrencyInput,
} from '@/utils/form-fields';
import {
    CLIENTS_BREADCRUMB,
    CLIENTS_LIST_URL,
    EMPTY_CLIENT_FORM,
} from './constants';
import type {
    ApiParams,
    ClientCredit,
    ClientFormValues,
    ClientInitialData,
    ClientRow,
    ClientSubmitData,
} from './types';

export function clientDetailsUrl(id: number): string {
    return withAppBasePath(`/dashboard/clients/${id}`);
}

export function getShowBreadcrumbs(customerId: number): BreadcrumbItem[] {
    return [
        CLIENTS_BREADCRUMB,
        {
            title: 'Detalhes do cliente',
            href: `/dashboard/clients/${customerId}`,
        },
    ];
}

// Remembers the filtered list so "Voltar" returns to it.
let lastClientsListUrl: string | null = null;

export function openClientDetails(id: number): void {
    lastClientsListUrl = window.location.href;
    router.visit(clientDetailsUrl(id));
}

export function goBackToClients(): void {
    router.visit(lastClientsListUrl ?? CLIENTS_LIST_URL);
}

export function useCustomersPage(apiParams: ApiParams) {
    return useQuery({
        queryKey: [...customersQueryKey, 'page', apiParams],
        queryFn: () => customerService.list(apiParams),
        placeholderData: keepPreviousData,
    });
}

export function useCustomer(id: number) {
    return useQuery({
        queryKey: [...customersQueryKey, 'detail', id],
        queryFn: () => customerService.get(id),
        retry: false,
    });
}

export async function fetchAllCustomers(
    apiParams: ApiParams,
): Promise<Customer[]> {
    const filters = Object.fromEntries(
        Object.entries(apiParams).filter(
            ([key]) => key !== 'page' && key !== 'per_page',
        ),
    );
    const response = await customerService.list({ ...filters, per_page: 100 });

    return response.data;
}

export function getClientCredit(customer: Customer): ClientCredit {
    const limit = toNumber(customer.credit_limit);
    const openBalance = toNumber(customer.open_balance);

    return {
        limit,
        openBalance,
        available: Math.max(0, limit - openBalance),
    };
}

export function toClientRow(customer: Customer): ClientRow {
    const credit = getClientCredit(customer);

    return {
        id: String(customer.id),
        customer,
        name: customer.name,
        personType: customer.person_type,
        document: formatDocumentDisplay(customer.document),
        email: customer.email || '-',
        phone: formatPhoneDisplay(customer.phone),
        creditEnabled: Boolean(customer.credit_enabled),
        creditLimit: credit.limit,
        availableCredit: credit.available,
        creditTermDays: toNumber(customer.credit_term_days),
        status: customer.status,
        createdAt: customer.createdAt ?? null,
    };
}

export function toInitialData(customer: Customer): ClientInitialData {
    return {
        id: customer.id,
        name: customer.name,
        email: customer.email ?? '',
        phone: customer.phone ?? '',
        document: customer.document ?? '',
        personType: customer.person_type,
        creditEnabled: Boolean(customer.credit_enabled),
        creditLimit: toNumber(customer.credit_limit),
        creditTermDays: toNumber(customer.credit_term_days) || 30,
        status: customer.status,
    };
}

export function toClientFormValues(
    initialData?: ClientInitialData,
): ClientFormValues {
    if (!initialData) {
        return EMPTY_CLIENT_FORM;
    }

    const creditLimit = Number(initialData.creditLimit ?? 0);

    return {
        name: initialData.name ?? '',
        person_type: initialData.personType ?? 'pf',
        email: initialData.email ?? '',
        phone: initialData.phone ?? '',
        document: initialData.document ?? '',
        status: initialData.status ?? 'active',
        credit_enabled: initialData.creditEnabled ? 'yes' : 'no',
        credit_limit:
            creditLimit > 0
                ? formatCurrencyInput(String(Math.round(creditLimit * 100)))
                : '',
        credit_term_days: String(initialData.creditTermDays || 30),
    };
}

export function toClientSubmitData(values: ClientFormValues): ClientSubmitData {
    const creditEnabled = values.credit_enabled === 'yes';

    return {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        document: values.document.trim(),
        person_type: values.person_type,
        status: values.status,
        credit_enabled: creditEnabled,
        credit_limit: creditEnabled
            ? parseCurrencyInput(values.credit_limit)
            : 0,
        credit_term_days: Number(values.credit_term_days),
    };
}
