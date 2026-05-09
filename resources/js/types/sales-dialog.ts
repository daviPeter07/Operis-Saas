import type { UiSale } from '@/types/dashboard-entities';

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

export type SalesRecord = UiSale & {
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
    availableCredit?: number;
    paidInstallments?: number[];
    delivered?: boolean;
};
