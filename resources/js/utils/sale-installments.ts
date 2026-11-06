import { formatCurrencyBR } from '@/lib/format';
import type { Sale } from '@/schemas/sale';

// Same rule as the API: floor in cents, leftover cents on the last installment.
export function splitInstallments(financed: number, count: number): number[] {
    const installments = Math.max(1, Math.floor(count) || 1);
    const financedCents = Math.round(financed * 100);
    const baseCents = Math.floor(financedCents / installments);
    const lastCents = financedCents - baseCents * (installments - 1);

    return Array.from(
        { length: installments },
        (_, index) =>
            (index === installments - 1 ? lastCents : baseCents) / 100,
    );
}

export function splitSaleInstallments(sale: Sale): number[] {
    const financed = Math.max(
        0,
        Number(sale.total ?? 0) - Number(sale.crediario_entry ?? 0),
    );

    return splitInstallments(financed, sale.installments ?? 1);
}

export function describeInstallments(amounts: number[]): string {
    if (amounts.length === 0) {
        return '-';
    }

    const [first] = amounts;
    const last = amounts[amounts.length - 1];
    const head = amounts.slice(0, -1);

    if (amounts.every((amount) => amount === first)) {
        return `${amounts.length}x de ${formatCurrencyBR(first)}`;
    }

    if (head.every((amount) => amount === first)) {
        return `${head.length}x de ${formatCurrencyBR(first)} + 1x de ${formatCurrencyBR(last)}`;
    }

    return amounts.map(formatCurrencyBR).join(' + ');
}
