import { nowInAppTimeZone } from '@/lib/app-timezone';

export function todayString(daysAgo = 0): string {
    const brazilNow = nowInAppTimeZone();

    brazilNow.setHours(0, 0, 0, 0);
    brazilNow.setDate(brazilNow.getDate() - daysAgo);

    const year = brazilNow.getFullYear();
    const month = String(brazilNow.getMonth() + 1).padStart(2, '0');
    const day = String(brazilNow.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
