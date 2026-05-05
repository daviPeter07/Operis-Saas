import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PAYMENT_METHOD_LABELS } from '@/constants/payment-methods';
import { STATUS_LABELS } from '@/constants/status';

export function formatDateBR(dateString: string): string {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
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
