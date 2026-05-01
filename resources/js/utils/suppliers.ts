import type { SupplierForm } from '@/types/dashboard-forms';

export function composeSupplierAddress(form: SupplierForm): string {
    return [form.street, form.number, form.neighborhood, form.zipCode]
        .filter(Boolean)
        .join(', ');
}
