/**
 * The business runs in Manaus (Amazonas). Every "today", period and date/time
 * shown in the app uses this zone, whatever the timezone of the visitor's device.
 * Keep in sync with config('app.business_timezone') on the backend.
 */
export const APP_TIME_ZONE = 'America/Manaus';

type DateParts = {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
};

function partsInAppTimeZone(date: Date): DateParts {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: APP_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(date);
    const value = (type: Intl.DateTimeFormatPartTypes) =>
        Number(parts.find((part) => part.type === type)?.value ?? 0);

    return {
        year: value('year'),
        month: value('month'),
        day: value('day'),
        hour: value('hour'),
        minute: value('minute'),
        second: value('second'),
    };
}

/**
 * Current wall-clock time in Manaus as a local Date (use its getFullYear,
 * getMonth, getDate, getHours...). Meant for calendar math, not for sending to the API.
 */
export function nowInAppTimeZone(reference: Date = new Date()): Date {
    const parts = partsInAppTimeZone(reference);

    return new Date(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second,
    );
}

/** Today's date in Manaus as "YYYY-MM-DD". */
export function todayInAppTimeZone(reference: Date = new Date()): string {
    const { year, month, day } = partsInAppTimeZone(reference);

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Formats an instant (ISO string with offset, or Date) as "dd/MM/yyyy HH:mm" in Manaus. */
export function formatInstantInAppTimeZone(
    value: string | Date,
): string | null {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const parts = partsInAppTimeZone(date);
    const pad = (input: number) => String(input).padStart(2, '0');

    return `${pad(parts.day)}/${pad(parts.month)}/${parts.year} ${pad(parts.hour)}:${pad(parts.minute)}`;
}
