import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PAYMENT_METHOD_LABELS } from '@/constants/payment-methods';
import { STATUS_LABELS } from '@/constants/status';

export function formatDateBR(dateString: string): string {
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

    if (dateOnlyMatch) {
        const year = Number(dateOnlyMatch[1]);
        const month = Number(dateOnlyMatch[2]);
        const day = Number(dateOnlyMatch[3]);

        return format(new Date(year, month - 1, day), 'dd/MM/yyyy', {
            locale: ptBR,
        });
    }

    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
}

export function formatDateTimeBR(dateTimeString: string): string {
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateTimeString);

    if (dateOnlyMatch) {
        const year = Number(dateOnlyMatch[1]);
        const month = Number(dateOnlyMatch[2]);
        const day = Number(dateOnlyMatch[3]);

        return format(new Date(year, month - 1, day), 'dd/MM/yyyy HH:mm', {
            locale: ptBR,
        });
    }

    const dateTimeMatch =
        /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
            dateTimeString,
        );

    if (dateTimeMatch) {
        const year = Number(dateTimeMatch[1]);
        const month = Number(dateTimeMatch[2]);
        const day = Number(dateTimeMatch[3]);
        const hours = Number(dateTimeMatch[4]);
        const minutes = Number(dateTimeMatch[5]);
        const seconds = Number(dateTimeMatch[6] || '0');

        return format(
            new Date(year, month - 1, day, hours, minutes, seconds),
            'dd/MM/yyyy HH:mm',
            { locale: ptBR },
        );
    }

    const parsed = new Date(dateTimeString);

    if (Number.isNaN(parsed.getTime())) {
        return dateTimeString;
    }

    return format(parsed, 'dd/MM/yyyy HH:mm', { locale: ptBR });
}

export function formatCurrencyBR(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export function translateStatus(status: string): string {
    return STATUS_LABELS[status] || status;
}

export function translatePaymentMethod(method: string): string {
    return PAYMENT_METHOD_LABELS[method] || method;
}

export function formatQuantityWithUnit(quantity: number): string {
    return `${quantity} un.`;
}
