import { createElement } from 'react';
import { StatusBadge } from '@/components/common/status-badge';
import { LinkedCount } from '@/components/table/linked-count';
import type { ServerColumn } from '@/components/table/server-table';
import { ENTITY_STATUS_OPTIONS } from '@/constants/entity-status';
import { formatCurrencyBR, translateStatus } from '@/lib/format';
import type { FieldOption } from '@/utils/form-fields';
import type { ServiceModalMode, ServiceModalText, ServiceRow } from './types';

export const SERVICES_BREADCRUMB = {
    title: 'Serviços',
    href: '/dashboard/services',
};

export const SERVICES_TITLE = 'Serviços';

export const CREATE_SERVICE_ACTION = 'create-service';

export const SERVICES_FILTER_KEYS = [
    'id',
    'name',
    'description',
    'status',
] as const;

export const STATUS_OPTIONS: FieldOption[] = [...ENTITY_STATUS_OPTIONS];

const NAME_COLUMN: ServerColumn<ServiceRow> = {
    key: 'name',
    header: 'Nome',
    sortKey: 'name',
    filter: { type: 'text', key: 'name' },
    className: 'max-w-56 wrap-anywhere',
};

const DESCRIPTION_COLUMN: ServerColumn<ServiceRow> = {
    key: 'description',
    header: 'Descrição',
    filter: { type: 'text', key: 'description' },
    className: 'max-w-80 wrap-anywhere text-muted-foreground',
    render: (row) =>
        createElement(
            'span',
            { className: 'line-clamp-2', title: row.description },
            row.description || '—',
        ),
};

const PRICE_COLUMN: ServerColumn<ServiceRow> = {
    key: 'price',
    header: 'Valor',
    sortKey: 'price',
    render: (row) => formatCurrencyBR(row.price),
};

const COST_COLUMN: ServerColumn<ServiceRow> = {
    key: 'cost',
    header: 'Custo',
    sortKey: 'cost',
    render: (row) => (row.cost === null ? '—' : formatCurrencyBR(row.cost)),
};

const PERFORMED_COLUMN: ServerColumn<ServiceRow> = {
    key: 'performedCount',
    header: 'Realizados',
    sortKey: 'performed_count',
    render: (row) =>
        createElement(LinkedCount, {
            count: row.performedCount,
            href: row.salesUrl,
            singular: 'vez',
            plural: 'vezes',
            title: 'Ver as vendas deste serviço',
        }),
};

const STATUS_COLUMN: ServerColumn<ServiceRow> = {
    key: 'status',
    header: 'Status',
    render: (row) => createElement(StatusBadge, { status: row.status }),
    filter: {
        type: 'select',
        key: 'status',
        allLabel: 'Todos',
        options: STATUS_OPTIONS,
    },
};

export const SERVICE_COLUMNS: ServerColumn<ServiceRow>[] = [
    NAME_COLUMN,
    DESCRIPTION_COLUMN,
    PRICE_COLUMN,
    COST_COLUMN,
    PERFORMED_COLUMN,
    STATUS_COLUMN,
];

// Plain text in the spreadsheet instead of the link and the badge.
export const SERVICE_EXPORT_COLUMNS: ServerColumn<ServiceRow>[] = [
    NAME_COLUMN,
    { ...DESCRIPTION_COLUMN, render: (row) => row.description },
    PRICE_COLUMN,
    COST_COLUMN,
    { ...PERFORMED_COLUMN, render: (row) => String(row.performedCount) },
    { ...STATUS_COLUMN, render: (row) => translateStatus(row.status) },
];

export const SERVICE_MODAL_TEXT: Record<ServiceModalMode, ServiceModalText> = {
    create: {
        title: 'Novo serviço',
        description: 'Preencha os dados abaixo para cadastrar um serviço.',
        submit: 'Criar',
        success: 'Serviço criado com sucesso.',
    },
    edit: {
        title: 'Editar serviço',
        description: 'Atualize os dados do serviço.',
        submit: 'Salvar',
        success: 'Serviço atualizado com sucesso.',
    },
};

export const SERVICE_PLACEHOLDERS = {
    name: 'Ex.: Manutenção de impressora',
    description: 'O que está incluído no serviço',
} as const;

export const COST_TOOLTIP =
    'Opcional. Preencha quando o serviço é feito por terceiros: o lucro da venda desconta esse valor.';

export const SAVE_SERVICE_ERROR = 'Não foi possível salvar o serviço.';

export const SERVICE_LIMITS = {
    nameLength: 255,
    descriptionLength: 1000,
    maxAmount: 999_999_999_999.99,
} as const;
