import type { UiSupplier } from '@/types/dashboard-entities';
import type { SupplierForm } from '@/types/dashboard-forms';

type AddressFormShape = {
    street: string;
    number: string;
    neighborhood: string;
    zipCode: string;
};

export function composeSupplierAddress(
    form: SupplierForm | AddressFormShape,
): string {
    return [form.street, form.number, form.neighborhood, form.zipCode]
        .filter(Boolean)
        .join(', ');
}

export function buildQuickCreateSupplierPayload(name: string): UiSupplier {
    return {
        id: '',
        name: name.trim(),
        email: '',
        phone: '',
        document: '',
        city: '',
        state: '',
        address: '',
        createdAt: '',
    };
}

export function createSupplierRecord(data: UiSupplier): UiSupplier {
    return {
        id: crypto.randomUUID(),
        name: String(data.name || '').trim(),
        email: String(data.email || '').trim(),
        phone: String(data.phone || '').trim(),
        document: String(data.document || '').trim(),
        city: String(data.city || '').trim(),
        state: String(data.state || '').trim(),
        address: String(data.address || '').trim(),
        createdAt: new Date().toISOString().slice(0, 10),
    };
}
