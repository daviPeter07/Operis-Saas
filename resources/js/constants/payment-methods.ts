export const PAYMENT_METHOD_LABELS: Record<string, string> = {
    money: 'Dinheiro',
    cash: 'Dinheiro',
    pix: 'PIX',
    card: 'Cartao',
    card_debit: 'Cartao debito',
    card_credit: 'Cartao credito',
    credit: 'Cartao de credito',
    debit: 'Cartao de debito',
    installment: 'Parcelado',
    crediario: 'Crediario',
    boleto: 'Boleto',
};

export const PAYMENT_METHOD_OPTIONS = [
    { value: 'money', label: PAYMENT_METHOD_LABELS.money },
    { value: 'pix', label: PAYMENT_METHOD_LABELS.pix },
    { value: 'card', label: PAYMENT_METHOD_LABELS.card },
    { value: 'installment', label: PAYMENT_METHOD_LABELS.installment },
    { value: 'crediario', label: PAYMENT_METHOD_LABELS.crediario },
    { value: 'boleto', label: PAYMENT_METHOD_LABELS.boleto },
] as const;
