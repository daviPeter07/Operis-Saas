import type { ClientPersonType } from '@/types/dashboard-forms';

export const PERSON_TYPE_OPTIONS = [
    { value: 'pf', label: 'Pessoa Física' },
    { value: 'pj', label: 'Pessoa Jurídica' },
] as const;

export const PERSON_TYPE_LABELS: Record<ClientPersonType, string> = {
    pf: 'Pessoa Física',
    pj: 'Pessoa Jurídica',
};

export const PERSON_TYPE_COLORS: Record<
    ClientPersonType,
    { bg: string; text: string }
> = {
    pf: { bg: 'bg-blue-100', text: 'text-blue-700' },
    pj: { bg: 'bg-purple-100', text: 'text-purple-700' },
};
