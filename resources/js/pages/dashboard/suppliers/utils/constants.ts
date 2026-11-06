import { createElement } from 'react';
import { PersonTypeBadge } from '@/components/common/person-type-badge';
import { StatusBadge } from '@/components/common/status-badge';
import type { ServerColumn } from '@/components/table/server-table';
import { ENTITY_STATUS_OPTIONS } from '@/constants/entity-status';
import {
    PERSON_TYPE_LABELS,
    PERSON_TYPE_OPTIONS,
} from '@/constants/person-type';
import { withAppBasePath } from '@/constants/workspace';
import { formatDateBR, translateStatus } from '@/lib/format';
import type {
    SupplierDialogMode,
    SupplierDialogText,
    SupplierRow,
} from './types';

export const SUPPLIERS_LIST_URL = withAppBasePath('/dashboard/suppliers');

export const SUPPLIERS_BREADCRUMB = {
    title: 'Fornecedores',
    href: '/dashboard/suppliers',
};

export const DELETE_SUPPLIER_DIALOG = {
    title: 'Excluir fornecedor',
    description:
        'Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita.',
};

export const DELETE_SUPPLIER_SUCCESS = 'Fornecedor excluído com sucesso.';

export const DELETE_SUPPLIER_ERROR = 'Não foi possível excluir o fornecedor.';

export const SUPPLIERS_FILTER_KEYS = [
    // A single record, opened from "Últimas atividades" on Visão Geral.
    'id',
    'name',
    'person_type',
    'document',
    'email',
    'phone',
    'status',
] as const;

export const NAME_COLUMN: ServerColumn<SupplierRow> = {
    key: 'name',
    header: 'Nome',
    sortKey: 'name',
    filter: { type: 'text', key: 'name' },
};

// The API matches the digits, so the document is found with or without the mask.
export const DOCUMENT_COLUMN: ServerColumn<SupplierRow> = {
    key: 'document',
    header: 'Documento',
    className: 'whitespace-nowrap',
    filter: { type: 'text', key: 'document' },
};

export const PERSON_TYPE_COLUMN: ServerColumn<SupplierRow> = {
    key: 'person_type',
    header: 'Tipo',
    render: (row) =>
        createElement(PersonTypeBadge, { personType: row.person_type }),
    filter: {
        type: 'select',
        key: 'person_type',
        allLabel: 'Todos',
        options: [...PERSON_TYPE_OPTIONS],
    },
};

export const EMAIL_COLUMN: ServerColumn<SupplierRow> = {
    key: 'email',
    header: 'E-mail',
    filter: { type: 'text', key: 'email' },
};

export const PHONE_COLUMN: ServerColumn<SupplierRow> = {
    key: 'phone',
    header: 'Telefone',
    filter: { type: 'text', key: 'phone' },
};

export const STATUS_COLUMN: ServerColumn<SupplierRow> = {
    key: 'status',
    header: 'Status',
    render: (row) => createElement(StatusBadge, { status: row.status }),
    filter: {
        type: 'select',
        key: 'status',
        allLabel: 'Todos',
        options: [...ENTITY_STATUS_OPTIONS],
    },
};

export const CREATED_AT_COLUMN: ServerColumn<SupplierRow> = {
    key: 'createdAt',
    header: 'Cadastrado em',
    sortKey: 'created_at',
    render: (row) =>
        row.createdAt ? formatDateBR(row.createdAt.slice(0, 10)) : '-',
};

export const TABLE_COLUMNS: ServerColumn<SupplierRow>[] = [
    NAME_COLUMN,
    PERSON_TYPE_COLUMN,
    DOCUMENT_COLUMN,
    EMAIL_COLUMN,
    PHONE_COLUMN,
    STATUS_COLUMN,
    CREATED_AT_COLUMN,
];

// Plain text in the spreadsheet instead of the badges.
export const EXPORT_COLUMNS: ServerColumn<SupplierRow>[] = [
    NAME_COLUMN,
    {
        ...PERSON_TYPE_COLUMN,
        render: (row) => PERSON_TYPE_LABELS[row.person_type],
    },
    DOCUMENT_COLUMN,
    EMAIL_COLUMN,
    PHONE_COLUMN,
    { ...STATUS_COLUMN, render: (row) => translateStatus(row.status) },
    CREATED_AT_COLUMN,
];

export const SUPPLIER_DIALOG_TEXT: Record<
    SupplierDialogMode,
    SupplierDialogText
> = {
    create: {
        title: 'Novo fornecedor',
        description: 'Preencha os dados principais do fornecedor.',
        submit: 'Criar fornecedor',
    },
    edit: {
        title: 'Editar fornecedor',
        description: 'Atualize os dados do fornecedor.',
        submit: 'Salvar alterações',
    },
};

export const DOCUMENT_FIELD = {
    pf: { label: 'CPF', placeholder: '000.000.000-00', maxLength: 14 },
    pj: { label: 'CNPJ', placeholder: '00.000.000/0000-00', maxLength: 18 },
} as const;

// Mirrors StoreSupplierRequest / UpdateSupplierRequest.
export const SUPPLIER_LIMITS = {
    nameLength: 255,
    emailLength: 255,
    phoneLength: 20,
    documentLength: 20,
} as const;

export const NOT_INFORMED = 'Não informado';

export const SAVE_SUPPLIER_ERROR = 'Não foi possível salvar o fornecedor.';
