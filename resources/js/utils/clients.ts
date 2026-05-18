import type { UiCustomer } from '@/types/dashboard-entities';
import type {
    ClientCreateDialogPayload,
    ClientForm,
    ClientPersonType,
} from '@/types/dashboard-forms';

export function inferPersonType(document: string | null): ClientPersonType {
    const numericDocument = (document ?? '').replace(/\D/g, '');

    return numericDocument.length > 11 ? 'pj' : 'pf';
}

export function inferClientPersonType(document: string | null): ClientPersonType {
    return inferPersonType(document);
}

export function createClientRecord(
    data: ClientCreateDialogPayload,
): UiCustomer {
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

export function mapClientFormToPayload(
    form: ClientForm,
): ClientCreateDialogPayload {
    return {
        id: '',
        createdAt: '',
        name: form.name,
        personType: form.personType,
        email: form.email,
        phone: form.phone,
        document: form.document,
        city: form.city,
        state: form.state,
        address: form.street,
    };
}
