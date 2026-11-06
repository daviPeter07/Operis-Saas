import { Eye, PackageCheck, ShoppingBag } from 'lucide-react';
import type { StoreKpi } from './types';

export const STORE_BREADCRUMB = {
    title: 'Loja',
    href: '/dashboard/store',
};

export const STORE_COMING_SOON = {
    title: 'Loja em breve',
    description:
        'Estamos preparando a sua loja virtual: os produtos do estoque vão direto para a vitrine, com preço e disponibilidade sempre atualizados, e os pedidos chegam aqui para você acompanhar.',
} as const;

/** How many stock products the preview shows in the showcase. */
export const STORE_PREVIEW_LIMIT = 8;

// Sample numbers for the preview; the real ones come with the module.
export const STORE_PREVIEW_KPIS: StoreKpi[] = [
    { label: 'Visitas no mês', value: '1.284', icon: Eye },
    { label: 'Pedidos', value: '37', icon: ShoppingBag },
    { label: 'Prontos para envio', value: '5', icon: PackageCheck },
];
