import type { Sale } from '@/schemas/sale';
import { toNumber } from '@/services/normalizers';

export function calculateSaleProfit(sale: Pick<Sale, 'items'>): number {
    return (sale.items ?? []).reduce(
        (sum, item) =>
            sum +
            (toNumber(item.unit_price) - toNumber(item.unit_cost)) *
                toNumber(item.quantity),
        0,
    );
}

export function calculateSalesProfit(
    sales: Array<Pick<Sale, 'items' | 'status'>>,
): number {
    return sales
        .filter((sale) => sale.status !== 'cancelled')
        .reduce((sum, sale) => sum + calculateSaleProfit(sale), 0);
}
