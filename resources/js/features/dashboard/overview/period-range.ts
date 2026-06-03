import type { CustomRange, Period } from './period-filter';

export interface DateRange {
    from: string;
    to: string;
}

function atStartOfDay(referenceDate: Date): Date {
    const date = new Date(referenceDate);
    date.setHours(0, 0, 0, 0);

    return date;
}

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatDateOffset(days: number, referenceDate: Date): string {
    const date = atStartOfDay(referenceDate);
    date.setDate(date.getDate() - days);

    return formatDate(date);
}

export function normalizeDateString(value: unknown): string | null {
    if (typeof value !== 'string' || !value) {
        return null;
    }

    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);

    return match ? match[1] : null;
}

export function getCurrentMonthRange(referenceDate: Date = new Date()): DateRange {
    const to = atStartOfDay(referenceDate);
    const from = new Date(to);
    from.setDate(1);

    return {
        from: formatDate(from),
        to: formatDate(to),
    };
}

export function resolveDateRange(
    period: Period,
    customRange: CustomRange,
    referenceDate: Date = new Date(),
): DateRange | null {
    const today = formatDate(atStartOfDay(referenceDate));

    if (period === 'current-month') {
        return getCurrentMonthRange(referenceDate);
    }

    if (period === '7d') {
        return { from: formatDateOffset(6, referenceDate), to: today };
    }

    if (period === '30d') {
        return { from: formatDateOffset(29, referenceDate), to: today };
    }

    if (period === '90d') {
        return { from: formatDateOffset(89, referenceDate), to: today };
    }

    if (period === '12m') {
        const date = atStartOfDay(referenceDate);
        date.setMonth(date.getMonth() - 12);

        return { from: formatDate(date), to: today };
    }

    if (period === 'next-month') {
        const from = atStartOfDay(referenceDate);
        const to = new Date(from);
        const baseDay = to.getDate();
        to.setDate(1);
        to.setMonth(to.getMonth() + 1);
        const lastDayOfMonth = new Date(
            to.getFullYear(),
            to.getMonth() + 1,
            0,
        ).getDate();
        to.setDate(Math.min(baseDay, lastDayOfMonth));

        return {
            from: formatDate(from),
            to: formatDate(to),
        };
    }

    if (period === 'custom' && customRange.from && customRange.to) {
        return {
            from: customRange.from,
            to: customRange.to,
        };
    }

    return null;
}
