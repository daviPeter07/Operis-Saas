import { createElement } from 'react';
import { PersonTypeBadge } from '@/components/common/person-type-badge';
import { StatusBadge } from '@/components/common/status-badge';
import type { ServerColumn } from '@/components/table/server-table';
import {
    PERSON_TYPE_LABELS,
    PERSON_TYPE_OPTIONS,
} from '@/constants/person-type';
import { withAppBasePath } from '@/constants/workspace';
import { formatCurrencyBR, formatDateTimeManaus } from '@/lib/format';
import type { FieldOption } from '@/utils/form-fields';
import type {
    ClientDialogMode,
    ClientDialogText,
    ClientFormValues,
    ClientRow,
} from './types';

export const CLIENTS_LIST_URL = withAppBasePath('/dashboard/clients');

export const CLIENTS_BREADCRUMB = {
    title: 'Clientes',
    href: '/dashboard/clients',
};

// Opened from the header and quick actions shortcut "Adicionar Cliente".
export const CREATE_CLIENT_ACTION = 'create-client';

export const DELETE_CLIENT_DIALOG = {
    title: 'Excluir cliente',
    description:
        'Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.',
};

export const CLIENTS_FILTER_KEYS = [
    // A single record, opened from "Últimas atividades" on Visão Geral.
    'id',
    'name',
    'person_type',
    'document',
    'email',
    'phone',
    'credit_enabled',
] as const;

export const CREDIT_ENABLED_OPTIONS: FieldOption[] = [
    { value: '1', label: 'Habilitado' },
    { value: '0', label: 'Desabilitado' },
];

export const CREDIT_TERM_OPTIONS: FieldOption[] = [
    15, 30, 60, 90, 120, 150,
].map((days) => ({ value: String(days), label: `${days} dias` }));

export const CREDIT_DISABLED_TOOLTIP =
    'Habilite o crediário para preencher este campo';

export const NAME_COLUMN: ServerColumn<ClientRow> = {
    key: 'name',
    header: 'Nome',
    sortKey: 'name',
    filter: { type: 'text', key: 'name' },
};

export const PERSON_TYPE_COLUMN: ServerColumn<ClientRow> = {
    key: 'personType',
    header: 'Tipo',
    render: (row) =>
        createElement(PersonTypeBadge, { personType: row.personType }),
    filter: {
        type: 'select',
        key: 'person_type',
        allLabel: 'Todos',
        options: [...PERSON_TYPE_OPTIONS],
    },
};

export const DOCUMENT_COLUMN: ServerColumn<ClientRow> = {
    key: 'document',
    header: 'Documento',
    className: 'whitespace-nowrap',
    filter: { type: 'text', key: 'document' },
};

export const EMAIL_COLUMN: ServerColumn<ClientRow> = {
    key: 'email',
    header: 'E-mail',
    filter: { type: 'text', key: 'email' },
};

export const PHONE_COLUMN: ServerColumn<ClientRow> = {
    key: 'phone',
    header: 'Telefone',
    filter: { type: 'text', key: 'phone' },
};

function creditEnabledLabel(enabled: boolean): string {
    return enabled ? 'Habilitado' : 'Desabilitado';
}

export const CREDIT_ENABLED_COLUMN: ServerColumn<ClientRow> = {
    key: 'creditEnabled',
    header: 'Crediário',
    // Same chip as Ativo/Inativo.
    render: (row) =>
        createElement(StatusBadge, {
            status: row.creditEnabled ? 'active' : 'inactive',
            label: creditEnabledLabel(row.creditEnabled),
        }),
    filter: {
        type: 'select',
        key: 'credit_enabled',
        allLabel: 'Todos',
        options: CREDIT_ENABLED_OPTIONS,
    },
};

export const CREDIT_LIMIT_COLUMN: ServerColumn<ClientRow> = {
    key: 'creditLimit',
    header: 'Limite de crediário',
    sortKey: 'credit_limit',
    render: (row) => formatCurrencyBR(row.creditLimit),
};

export const AVAILABLE_CREDIT_COLUMN: ServerColumn<ClientRow> = {
    key: 'availableCredit',
    header: 'Crédito disponível',
    render: (row) =>
        row.creditEnabled ? formatCurrencyBR(row.availableCredit) : '-',
};

export const CREDIT_TERM_COLUMN: ServerColumn<ClientRow> = {
    key: 'creditTermDays',
    header: 'Prazo (dias)',
    render: (row) => (row.creditTermDays ? String(row.creditTermDays) : '-'),
};

export const STATUS_COLUMN: ServerColumn<ClientRow> = {
    key: 'status',
    header: 'Status',
    render: (row) => (row.status === 'active' ? 'Ativo' : 'Inativo'),
};

export const CREATED_AT_COLUMN: ServerColumn<ClientRow> = {
    key: 'createdAt',
    header: 'Cadastrado em',
    render: (row) =>
        row.createdAt ? formatDateTimeManaus(row.createdAt) : '-',
};

export const TABLE_COLUMNS: ServerColumn<ClientRow>[] = [
    NAME_COLUMN,
    PERSON_TYPE_COLUMN,
    DOCUMENT_COLUMN,
    EMAIL_COLUMN,
    PHONE_COLUMN,
    CREDIT_ENABLED_COLUMN,
    CREDIT_LIMIT_COLUMN,
    AVAILABLE_CREDIT_COLUMN,
];

// Plain text in the spreadsheet instead of the badge.
export const EXPORT_COLUMNS: ServerColumn<ClientRow>[] = [
    NAME_COLUMN,
    {
        ...PERSON_TYPE_COLUMN,
        render: (row) => PERSON_TYPE_LABELS[row.personType],
    },
    DOCUMENT_COLUMN,
    EMAIL_COLUMN,
    PHONE_COLUMN,
    {
        ...CREDIT_ENABLED_COLUMN,
        render: (row) => creditEnabledLabel(row.creditEnabled),
    },
    CREDIT_LIMIT_COLUMN,
    AVAILABLE_CREDIT_COLUMN,
    CREDIT_TERM_COLUMN,
    STATUS_COLUMN,
    CREATED_AT_COLUMN,
];

export const CLIENT_DIALOG_TEXT: Record<ClientDialogMode, ClientDialogText> = {
    create: {
        title: 'Novo Cliente',
        description: 'Preencha os dados principais do cliente.',
        submit: 'Criar',
        submitting: 'Criando...',
    },
    edit: {
        title: 'Editar Cliente',
        description: 'Preencha os dados principais do cliente.',
        submit: 'Salvar',
        submitting: 'Salvando...',
    },
};

// Mirrors Store/UpdateCustomerRequest.
export const CLIENT_LIMITS = {
    nameLength: 255,
    emailLength: 255,
    phoneLength: 20,
    documentLength: 20,
    maxCreditLimit: 100_000,
    minTermDays: 1,
    maxTermDays: 365,
} as const;

export const CREDIT_LIMIT_TOO_HIGH =
    'O limite do crediário pode ser de no máximo R$ 100.000,00.';

export const SAVE_CLIENT_ERROR = 'Não foi possível salvar o cliente.';

export const EMPTY_CLIENT_FORM: ClientFormValues = {
    name: '',
    person_type: 'pf',
    email: '',
    phone: '',
    document: '',
    status: 'active',
    credit_enabled: 'no',
    credit_limit: '',
    credit_term_days: '30',
};
