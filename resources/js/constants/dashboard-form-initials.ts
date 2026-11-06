import { todayInAppTimeZone } from '@/lib/app-timezone';
import type { ClientForm, FinancialEntryForm } from '@/types/dashboard-forms';

const today = todayInAppTimeZone();

export const initialPurchaseForm: FinancialEntryForm = {
    supplierName: '',
    items: '1',
    total: '',
    paymentMethod: 'pix',
    boletoTermDays: '30',
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
    boletoTermDays: '30',
    cardType: 'debit',
    installments: '1',
    firstInstallmentDate: today,
    status: 'pending',
    createdAt: today,
};

export const initialClientForm: ClientForm = {
    name: '',
    personType: 'pf',
    email: '',
    phone: '',
    document: '',
    status: 'active',
    creditEnabled: 'no',
    creditLimit: '',
    creditTermDays: '30',
    state: '',
    city: '',
    street: '',
    neighborhood: '',
    number: '',
    zipCode: '',
};
