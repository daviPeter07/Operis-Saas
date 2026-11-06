import type { LucideIcon } from 'lucide-react';

export type StoreProductCard = {
    id: number;
    name: string;
    price: number;
    stock: number;
    initials: string;
};

export type StoreKpi = {
    label: string;
    value: string;
    icon: LucideIcon;
};
