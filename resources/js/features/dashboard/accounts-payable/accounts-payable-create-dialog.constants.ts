import { STATUS_OPTIONS } from '@/constants/status';
import type { AccountsPayableForm } from './accounts-payable-create-dialog.types';

const today = new Date().toISOString().slice(0, 10);

export const initialAccountsPayableForm: AccountsPayableForm = {
    supplierName: '',
    items: '1',
    total: '',
    paymentMethod: 'pix',
    status: 'pending',
    dueDate: today,
    createdAt: today,
};

export const accountsPayableStatusOptions = STATUS_OPTIONS;
