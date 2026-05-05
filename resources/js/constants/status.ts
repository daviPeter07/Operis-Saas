export const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendente',
    completed: 'Concluido',
    cancelled: 'Cancelado',
};

export const STATUS_OPTIONS = [
    { value: 'pending', label: STATUS_LABELS.pending },
    { value: 'completed', label: STATUS_LABELS.completed },
] as const;

export const STATUS_VALUES = STATUS_OPTIONS.map((option) => option.value);
