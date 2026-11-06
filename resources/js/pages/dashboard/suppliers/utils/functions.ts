import { router } from '@inertiajs/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { withAppBasePath } from '@/constants/workspace';
import { suppliersQueryKey } from '@/hooks/use-suppliers';
import type { Supplier } from '@/schemas/supplier';
import { supplierService } from '@/services/suppliers';
import type { BreadcrumbItem } from '@/types';
import { formatDocumentDisplay, formatPhoneDisplay } from '@/utils/form-fields';
import { SUPPLIERS_BREADCRUMB, SUPPLIERS_LIST_URL } from './constants';
import type {
    ApiParams,
    SupplierFormValues,
    SupplierRow,
    SupplierSubmitData,
} from './types';

export function supplierDetailsUrl(id: number): string {
    return withAppBasePath(`/dashboard/suppliers/${id}`);
}

export function getShowBreadcrumbs(supplierId: number): BreadcrumbItem[] {
    return [
        SUPPLIERS_BREADCRUMB,
        {
            title: 'Detalhes do fornecedor',
            href: `/dashboard/suppliers/${supplierId}`,
        },
    ];
}

// Remembers the filtered list so "Voltar" returns to it.
let lastSuppliersListUrl: string | null = null;

export function openSupplierDetails(id: number): void {
    lastSuppliersListUrl = window.location.href;
    router.visit(supplierDetailsUrl(id));
}

export function goBackToSuppliers(): void {
    router.visit(lastSuppliersListUrl ?? SUPPLIERS_LIST_URL);
}

export function useSuppliersPage(apiParams: ApiParams) {
    return useQuery({
        queryKey: [...suppliersQueryKey, 'page', apiParams],
        queryFn: () => supplierService.list(apiParams),
        placeholderData: keepPreviousData,
    });
}

export function useSupplier(id: number) {
    return useQuery({
        queryKey: [...suppliersQueryKey, 'detail', id],
        queryFn: () => supplierService.get(id),
        retry: false,
    });
}

export async function fetchAllSuppliers(
    apiParams: ApiParams,
): Promise<Supplier[]> {
    const filters = Object.fromEntries(
        Object.entries(apiParams).filter(
            ([key]) => key !== 'page' && key !== 'per_page',
        ),
    );
    const response = await supplierService.list({ ...filters, per_page: 100 });

    return response.data;
}

export function toSupplierRow(supplier: Supplier): SupplierRow {
    return {
        id: String(supplier.id),
        supplier,
        name: supplier.name,
        document: formatDocumentDisplay(supplier.document),
        person_type: supplier.person_type,
        email: supplier.email || '-',
        phone: formatPhoneDisplay(supplier.phone),
        status: supplier.status,
        createdAt: supplier.createdAt ?? '',
    };
}

export function makeEmptySupplierForm(): SupplierFormValues {
    return {
        name: '',
        person_type: 'pj',
        email: '',
        phone: '',
        document: '',
    };
}

export function toSupplierFormValues(
    supplier?: Supplier | null,
    initialName = '',
): SupplierFormValues {
    if (!supplier) {
        return { ...makeEmptySupplierForm(), name: initialName };
    }

    return {
        name: supplier.name,
        person_type: supplier.person_type,
        email: supplier.email ?? '',
        phone: supplier.phone ?? '',
        document: supplier.document ?? '',
    };
}

export function toSupplierSubmitData(
    values: SupplierFormValues,
): SupplierSubmitData {
    return {
        name: values.name.trim(),
        person_type: values.person_type,
        email: values.email.trim(),
        phone: values.phone.trim(),
        document: values.document.trim(),
    };
}
