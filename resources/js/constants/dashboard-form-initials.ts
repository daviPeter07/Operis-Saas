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
    cardType: 'debit',
    installments: '1',
    firstInstallmentDate: today,
    status: 'pending',
    createdAt: today,
};

export const initialAccountsPayableForm: FinancialEntryForm = {
    supplierName: '',
    items: '1',
    total: '',
    paymentMethod: 'pix',
    cardType: 'debit',
    installments: '1',
    firstInstallmentDate: today,
    status: 'pending',
    createdAt: today,
};

export const initialSupplierForm: SupplierForm = {
    name: '',
    personType: 'pj',
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
