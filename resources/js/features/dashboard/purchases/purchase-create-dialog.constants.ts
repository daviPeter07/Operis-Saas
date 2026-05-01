import type { PurchaseForm } from './purchase-create-dialog.types';

const today = new Date().toISOString().slice(0, 10);

export const initialPurchaseForm: PurchaseForm = {
    supplierName: '',
    items: '1',
    total: '',
    paymentMethod: 'pix',
    status: 'pending',
    createdAt: today,
};
