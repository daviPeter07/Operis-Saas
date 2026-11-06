export function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

export const formatWholeCurrency = (value: number): string =>
    formatCurrency(value).replace(',00', '');

/** Formats an ISO date (YYYY-MM-DD) without timezone shifts, e.g. "5 de nov. de 2026". */
export function formatUpdateDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
