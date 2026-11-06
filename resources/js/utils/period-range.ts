import type { CustomRange, Period } from '@/components/filters/period-filter';

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

export function getCurrentMonthRange(
    referenceDate: Date = new Date(),
): DateRange {
    const to = atStartOfDay(referenceDate);
    const from = new Date(to);
    from.setDate(1);

    return {
        from: formatDate(from),
        to: formatDate(to),
    };
}

// The whole calendar month `offset` months away (-1 = last month).
function getMonthRange(offset: number, referenceDate: Date): DateRange {
    const from = new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth() + offset,
        1,
    );
    const to = new Date(from.getFullYear(), from.getMonth() + 1, 0);

    return { from: formatDate(from), to: formatDate(to) };
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

    if (period === 'previous-month') {
        return getMonthRange(-1, referenceDate);
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

function parseDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
}

function daysBetween(from: string, to: string): number {
    return Math.round(
        (parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000,
    );
}

/**
 * The period right before `range`, used to say whether a KPI grew.
 * Current month compares with the same days of last month; rolling and custom
 * periods compare with the window of the same length just before them.
 * Returns null when a comparison makes no sense (all time, next month).
 */
export function resolvePreviousRange(
    period: Period,
    range: DateRange | null,
): DateRange | null {
    if (!range || period === 'all' || period === 'next-month') {
        return null;
    }

    if (period === 'current-month') {
        const current = parseDate(range.to);
        const lastDayOfPreviousMonth = new Date(
            current.getFullYear(),
            current.getMonth(),
            0,
        ).getDate();
        const from = new Date(current.getFullYear(), current.getMonth() - 1, 1);
        const to = new Date(
            current.getFullYear(),
            current.getMonth() - 1,
            Math.min(current.getDate(), lastDayOfPreviousMonth),
        );

        return { from: formatDate(from), to: formatDate(to) };
    }

    // Last month compares with the whole month before it.
    if (period === 'previous-month') {
        return getMonthRange(-1, parseDate(range.from));
    }

    const length = daysBetween(range.from, range.to);
    const to = parseDate(range.from);
    to.setDate(to.getDate() - 1);
    const from = new Date(to);
    from.setDate(from.getDate() - length);

    return { from: formatDate(from), to: formatDate(to) };
}

export interface PeriodComparison {
    direction: 'up' | 'down' | 'flat';
    /** Percent change, or null when the previous period was zero. */
    percent: number | null;
}

export function comparePeriods(
    current: number,
    previous: number,
): PeriodComparison {
    if (previous === 0) {
        return {
            direction: current > 0 ? 'up' : current < 0 ? 'down' : 'flat',
            percent: null,
        };
    }

    const percent = ((current - previous) / Math.abs(previous)) * 100;

    return {
        direction:
            Math.abs(percent) < 0.05 ? 'flat' : percent > 0 ? 'up' : 'down',
        percent,
    };
}

export interface SeriesBucket {
    key: string;
    label: string;
}

/**
 * Buckets for the overview charts: one per day for ranges up to 62 days,
 * otherwise one per month, always covering the whole range (empty days count as 0).
 */
export function buildSeriesBuckets(range: DateRange): SeriesBucket[] {
    const buckets: SeriesBucket[] = [];

    if (daysBetween(range.from, range.to) <= 61) {
        const cursor = parseDate(range.from);
        const end = parseDate(range.to);

        while (cursor <= end) {
            const key = formatDate(cursor);
            buckets.push({
                key,
                label: `${key.slice(8, 10)}/${key.slice(5, 7)}`,
            });
            cursor.setDate(cursor.getDate() + 1);
        }

        return buckets;
    }

    const cursor = parseDate(range.from);
    cursor.setDate(1);
    const end = parseDate(range.to);

    while (cursor <= end) {
        const key = formatDate(cursor).slice(0, 7);
        buckets.push({ key, label: `${key.slice(5, 7)}/${key.slice(2, 4)}` });
        cursor.setMonth(cursor.getMonth() + 1);
    }

    return buckets;
}

/** Bucket key of a date (YYYY-MM-DD) for the given buckets (daily or monthly). */
export function bucketKeyFor(date: string, buckets: SeriesBucket[]): string {
    return buckets[0]?.key.length === 7 ? date.slice(0, 7) : date;
}

/** Human-readable range, e.g. "01/11/2026 a 05/11/2026". */
/**
 * Short label of a comparison window for the KPI cards: "01/10 a 06/10", with the
 * year only when the window crosses into another year ("07/11/25 a 06/11/26").
 */
export function formatComparisonRange(range: DateRange): string {
    const sameYear = range.from.slice(0, 4) === range.to.slice(0, 4);
    const short = (value: string) =>
        `${value.slice(8, 10)}/${value.slice(5, 7)}${sameYear ? '' : `/${value.slice(2, 4)}`}`;

    return range.from === range.to
        ? short(range.from)
        : `${short(range.from)} a ${short(range.to)}`;
}

export function formatRangeLabel(range: DateRange): string {
    const toBr = (value: string) =>
        `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}`;

    return range.from === range.to
        ? toBr(range.from)
        : `${toBr(range.from)} a ${toBr(range.to)}`;
}
