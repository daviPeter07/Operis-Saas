import type { AccountsPayableForm } from './accounts-payable-create-dialog.types';

const today = new Date().toISOString().slice(0, 10);

export const initialAccountsPayableForm: AccountsPayableForm = {
    supplierName: '',
    items: '1',
    total: '',
    paymentMethod: 'pix',
    status: 'pending',
    createdAt: today,
};
