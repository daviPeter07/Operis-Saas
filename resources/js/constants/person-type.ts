export const PERSON_TYPE_LABELS = {
    pf: 'Pessoa Fisica',
    pj: 'Pessoa Juridica',
} as const;

export const PERSON_TYPE_OPTIONS = [
    { value: 'pf', label: PERSON_TYPE_LABELS.pf },
    { value: 'pj', label: PERSON_TYPE_LABELS.pj },
] as const;
