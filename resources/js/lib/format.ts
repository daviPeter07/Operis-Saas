import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    const statusMap: Record<string, string> = {
        pending: 'Pendente',
        completed: 'Concluido',
        cancelled: 'Cancelado',
    };

    return statusMap[status] || status;
}

export function translatePaymentMethod(method: string): string {
    const methodMap: Record<string, string> = {
        money: 'Dinheiro',
        pix: 'PIX',
        card: 'Cartao',
        other: 'Outros',
    };

    return methodMap[method] || method;
}

export function formatQuantityWithUnit(quantity: number): string {
    return `${quantity} un.`;
}
