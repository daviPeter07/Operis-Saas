import { CONTACT_WHATSAPP_MESSAGE, SALES_WHATSAPP_NUMBER } from './constants';
import type { PricingPlan } from './types';

export function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

export const formatWholeCurrency = (value: number): string =>
    formatCurrency(value).replace(',00', '');

function whatsAppUrl(message: string): string {
    return `https://wa.me/${SALES_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** WhatsApp chat with a first message, for the "talk to us" buttons. */
export function getContactWhatsAppUrl(): string {
    return whatsAppUrl(CONTACT_WHATSAPP_MESSAGE);
}

/** WhatsApp chat with the plan already named in the message. */
export function getPlanWhatsAppUrl(plan: PricingPlan): string {
    const price =
        plan.price === null
            ? ''
            : `, de ${formatWholeCurrency(plan.price)} por ${plan.period}`;

    return whatsAppUrl(
        `Olá, tudo bem? Vim pelo site de vocês e tenho interesse no ${plan.name.toLowerCase()} do Operis${price}. ` +
            'Gostaria de saber mais sobre o sistema e como faço para ter acesso.',
    );
}

/** Formats an ISO date (YYYY-MM-DD) without timezone shifts, e.g. "5 de nov. de 2026". */
export function formatUpdateDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/** ISO date (YYYY-MM-DD) in full, e.g. "6 de novembro de 2026". */
export function formatLongDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}
