import type {
    ClientForm,
    FinancialEntryForm,
    SupplierForm,
} from '@/types/dashboard-forms';

const today = new Date().toISOString().slice(0, 10);

export const initialPurchaseForm: FinancialEntryForm = {
    supplierName: '',
    items: '1',
    total: '',
    paymentMethod: 'pix',
    status: 'pending',
    createdAt: today,
};

export const initialAccountsPayableForm: FinancialEntryForm = {
    supplierName: '',
    items: '1',
    total: '',
    paymentMethod: 'pix',
    status: 'pending',
    createdAt: today,
};

export const initialSupplierForm: SupplierForm = {
    name: '',
    email: '',
    phone: '',
    document: '',
    state: '',
    city: '',
    street: '',
    neighborhood: '',
    number: '',
    zipCode: '',
};

export const initialClientForm: ClientForm = {
    name: '',
    personType: 'pf',
    email: '',
    phone: '',
    document: '',
    state: '',
    city: '',
    street: '',
    neighborhood: '',
    number: '',
    zipCode: '',
};
