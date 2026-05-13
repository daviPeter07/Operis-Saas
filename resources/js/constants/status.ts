export const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendente',
    completed: 'Concluido',
    received: 'Recebido',
    paid: 'Pago',
    cancelled: 'Cancelado',
    active: 'Ativo',
    inactive: 'Inativo',
};

export const STATUS_OPTIONS = [
    { value: 'pending', label: STATUS_LABELS.pending },
    { value: 'completed', label: STATUS_LABELS.completed },
    { value: 'active', label: STATUS_LABELS.active },
    { value: 'inactive', label: STATUS_LABELS.inactive },
] as const;

export const STATUS_VALUES = STATUS_OPTIONS.map((option) => option.value);
