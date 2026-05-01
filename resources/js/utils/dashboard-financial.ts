import type { Product, Purchase } from '@/lib/mocks/mock-data';
import type { FinancialEntryForm, PurchaseLineItem } from '@/types/dashboard-forms';

export function computePurchaseTotals(
    items: PurchaseLineItem[],
    products: Product[],
): { items: number; total: number } {
    return items.reduce(
        (acc, item) => {
            const product = products.find((entry) => entry.id === item.productId);
            if (!product) {
                return acc;
            }

            acc.items += item.quantity;
            acc.total += product.cost * item.quantity;
            return acc;
        },
        { items: 0, total: 0 },
    );
}

export function mapFinancialFormToPurchase(
    form: FinancialEntryForm,
    fallback: { items: number; total: number },
): Purchase {
    return {
        id: '',
        supplierId: '',
        supplierName: form.supplierName,
        total: Number(form.total || 0) || fallback.total,
        status: form.status as Purchase['status'],
        paymentMethod: form.paymentMethod as Purchase['paymentMethod'],
        items: Number(form.items || 0) || fallback.items,
        dueDate: form.createdAt,
        createdAt: form.createdAt,
    };
}

export function mapFinancialFormToAccountsPayable(
    form: FinancialEntryForm,
): Purchase {
    return {
        id: '',
        supplierId: '',
        supplierName: form.supplierName,
        total: Number(form.total || 0),
        status: form.status as Purchase['status'],
        paymentMethod: form.paymentMethod as Purchase['paymentMethod'],
        items: Number(form.items || 1),
        dueDate: form.createdAt,
        createdAt: form.createdAt,
    };
}
