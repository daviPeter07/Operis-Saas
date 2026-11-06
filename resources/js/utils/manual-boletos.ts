import { format } from 'date-fns';

export type ManualBoleto = {
    number: number;
    dueDate: string;
    amount: number;
};

export function addMonthsKeepingDay(date: string, months: number): string {
    const [year, month, day] = date.split('-').map(Number);
    const target = new Date(year, month - 1 + months, 1);
    const lastDay = new Date(
        target.getFullYear(),
        target.getMonth() + 1,
        0,
    ).getDate();

    target.setDate(Math.min(day, lastDay));

    return format(target, 'yyyy-MM-dd');
}

// Same split as PayableService::createManual: one boleto per 30
// days of term, due month by month after the entry date, leftover cents on the first ones.
export function splitManualBoletos(
    total: number,
    term: number,
    entryDate: string,
): ManualBoleto[] {
    const count = Math.max(1, Math.ceil(Math.max(30, term) / 30));
    const totalCents = Math.round(total * 100);
    const baseCents = Math.floor(totalCents / count);
    const remainder = totalCents - baseCents * count;

    return Array.from({ length: count }, (_, index) => ({
        number: index + 1,
        dueDate: addMonthsKeepingDay(entryDate, index + 1),
        amount: (baseCents + (index < remainder ? 1 : 0)) / 100,
    }));
}
