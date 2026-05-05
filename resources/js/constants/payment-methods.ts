export const PAYMENT_METHOD_LABELS: Record<string, string> = {
    money: 'Dinheiro',
    cash: 'Dinheiro',
    pix: 'PIX',
    card: 'Cartão',
    credit: 'Cartão de crédito',
    debit: 'Cartão de débito',
    other: 'Outros',
    installment: 'Parcelado',
};

export const PAYMENT_METHOD_OPTIONS = [
    { value: 'money', label: PAYMENT_METHOD_LABELS.money },
    { value: 'pix', label: PAYMENT_METHOD_LABELS.pix },
    { value: 'card', label: PAYMENT_METHOD_LABELS.card },
    { value: 'credit', label: PAYMENT_METHOD_LABELS.credit },
    { value: 'debit', label: PAYMENT_METHOD_LABELS.debit },
    { value: 'other', label: PAYMENT_METHOD_LABELS.other },
    { value: 'installment', label: PAYMENT_METHOD_LABELS.installment },
] as const;
