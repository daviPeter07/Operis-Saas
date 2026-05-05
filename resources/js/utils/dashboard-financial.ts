import type { UiPurchase } from '@/types/dashboard-entities';
import type {
    FinancialEntryForm,
    PurchaseLineItem,
} from '@/types/dashboard-forms';

function resolvePurchasePaymentMethod(
    form: FinancialEntryForm,
): UiPurchase['paymentMethod'] {
    if (form.paymentMethod === 'card') {
        return form.cardType;
    }

    if (
        form.paymentMethod === 'money' ||
        form.paymentMethod === 'pix' ||
        form.paymentMethod === 'credit' ||
        form.paymentMethod === 'debit'
    ) {
        return form.paymentMethod;
    }

    return 'pix';
}

function resolveDueDate(form: FinancialEntryForm): string {
    if (form.paymentMethod === 'card' && form.cardType === 'credit') {
        return form.firstInstallmentDate || form.createdAt;
    }

    return form.createdAt;
}

export function computePurchaseTotals(
    items: PurchaseLineItem[],
): { items: number; total: number } {
    return items.reduce(
        (acc, item) => {
            if (!item.productId || item.quantity <= 0) {
                return acc;
            }

            acc.items += item.quantity;
            acc.total += item.unitCost * item.quantity;

            return acc;
        },
        { items: 0, total: 0 },
    );
}

export function mapFinancialFormToPurchase(
    form: FinancialEntryForm,
    fallback: { items: number; total: number },
): UiPurchase {
    return {
        id: '',
        supplierId: '',
        supplierName: form.supplierName,
        total: Number(form.total || 0) || fallback.total,
        status: form.status as UiPurchase['status'],
        paymentMethod: resolvePurchasePaymentMethod(form),
        items: Number(form.items || 0) || fallback.items,
        dueDate: resolveDueDate(form),
        createdAt: form.createdAt,
    };
}

export function mapFinancialFormToAccountsPayable(
    form: FinancialEntryForm,
): UiPurchase {
    return {
        id: '',
        supplierId: '',
        supplierName: form.supplierName,
        total: Number(form.total || 0),
        status: form.status as UiPurchase['status'],
        paymentMethod: resolvePurchasePaymentMethod(form),
        items: Number(form.items || 1),
        dueDate: resolveDueDate(form),
        createdAt: form.createdAt,
    };
}
