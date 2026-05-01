import type { Sale } from '@/lib/mocks/mock-data';

export type SaleDiscountType = 'amount' | 'percent';

export type SalesLineItem = {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    unitCost: number;
    subtotal: number;
};

export type SalesRecord = Sale & {
    notes?: string;
    lineItems: SalesLineItem[];
    discountType?: SaleDiscountType;
    discountValue?: number;
    discountAmountApplied?: number;
    finalTotal?: number;
    cardType?: 'debit' | 'credit';
    installments?: number;
    firstInstallmentDate?: string;
    installmentValue?: number;
};
