import type { Supplier } from '@/lib/mocks/mock-data';
import type { SupplierForm } from '@/types/dashboard-forms';

export function composeSupplierAddress(form: SupplierForm): string {
    return [form.street, form.number, form.neighborhood, form.zipCode]
        .filter(Boolean)
        .join(', ');
}

export function buildQuickCreateSupplierPayload(name: string): Supplier {
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

export function createSupplierRecord(data: Supplier): Supplier {
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
