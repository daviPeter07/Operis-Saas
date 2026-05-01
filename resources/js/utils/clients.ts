import type { Client } from '@/lib/mocks/mock-data';
import type {
    ClientCreateDialogPayload,
    ClientForm,
    ClientPersonType,
} from '@/types/dashboard-forms';
import { composeSupplierAddress } from '@/utils/suppliers';

export function inferPersonType(document: string): ClientPersonType {
    const numericDocument = document.replace(/\D/g, '');

    return numericDocument.length > 11 ? 'pj' : 'pf';
}

export function inferClientPersonType(document: string): ClientPersonType {
    return inferPersonType(document);
}

export function createClientRecord(data: ClientCreateDialogPayload): Client {
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
        state: form.state,
        city: form.city,
        address: composeSupplierAddress(form),
    };
}
