import { createElement } from 'react';
import { StatusBadge } from '@/components/common/status-badge';
import type { ServerColumn } from '@/components/table/server-table';
import { ENTITY_STATUS_OPTIONS } from '@/constants/entity-status';
import type { FieldOption } from '@/utils/form-fields';
import type { BrandModalMode, BrandModalText, BrandRow } from './types';

export const BRANDS_BREADCRUMB = {
    title: 'Marcas',
    href: '/dashboard/brands',
};

export const BRANDS_TITLE = 'Marcas';

export const CREATE_BRAND_ACTION = 'create-brand';

export const BRANDS_FILTER_KEYS = ['name', 'status'] as const;

export const STATUS_OPTIONS: FieldOption[] = [...ENTITY_STATUS_OPTIONS];

export const BRAND_COLUMNS: ServerColumn<BrandRow>[] = [
    {
        key: 'name',
        header: 'Nome',
        sortKey: 'name',
        filter: { type: 'text', key: 'name' },
    },
    {
        key: 'status',
        header: 'Status',
        render: (row) => createElement(StatusBadge, { status: row.status }),
        filter: {
            type: 'select',
            key: 'status',
            allLabel: 'Todos',
            options: STATUS_OPTIONS,
        },
    },
];

export const BRAND_MODAL_TEXT: Record<BrandModalMode, BrandModalText> = {
    create: {
        title: 'Nova marca',
        description: 'Preencha os dados abaixo para criar uma marca.',
        submit: 'Criar',
        success: 'Marca criada com sucesso.',
    },
    edit: {
        title: 'Editar marca',
        description: 'Atualize os dados da marca.',
        submit: 'Salvar',
        success: 'Marca atualizada com sucesso.',
    },
};

export const BRAND_NAME_PLACEHOLDER = 'Digite o nome da marca';

export const SAVE_BRAND_ERROR = 'Não foi possível salvar a marca.';

// Mirrors Store/UpdateBrandRequest.
export const BRAND_LIMITS = {
    nameLength: 255,
} as const;
