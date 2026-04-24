import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Format a date string to Brazilian format (dd/MM/yyyy)
 */
export function formatDateBR(dateString: string): string {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
}

/**
 * Format a number to Brazilian currency (BRL)
 */
export function formatCurrencyBR(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

/**
 * Translate sale status to Portuguese
 */
export function translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
        pending: 'Pendente',
        completed: 'Concluído',
        cancelled: 'Cancelado',
    };

    return statusMap[status] || status;
}

/**
 * Translate payment method to Portuguese
 */
export function translatePaymentMethod(method: string): string {
    const methodMap: Record<string, string> = {
        money: 'Dinheiro',
        credit: 'Crédito',
        debit: 'Débito',
        pix: 'PIX',
        installment: 'Parcelado',
    };

    return methodMap[method] || method;
}

/**
 * Format quantity with unit (un.)
 */
export function formatQuantityWithUnit(quantity: number): string {
    return `${quantity} un.`;
}
