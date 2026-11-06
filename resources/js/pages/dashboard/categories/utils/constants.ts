import { createElement } from 'react';
import { StatusBadge } from '@/components/common/status-badge';
import { LinkedCount } from '@/components/table/linked-count';
import type { ServerColumn } from '@/components/table/server-table';
import { ENTITY_STATUS_OPTIONS } from '@/constants/entity-status';
import { translateStatus } from '@/lib/format';
import type { FieldOption } from '@/utils/form-fields';
import type {
    CategoryModalMode,
    CategoryModalText,
    CategoryRow,
} from './types';

export const CATEGORIES_BREADCRUMB = {
    title: 'Categorias',
    href: '/dashboard/categories',
};

export const CATEGORIES_TITLE = 'Categorias';

export const CREATE_CATEGORY_ACTION = 'create-category';

export const CATEGORIES_FILTER_KEYS = ['name', 'status'] as const;

export const STATUS_OPTIONS: FieldOption[] = [...ENTITY_STATUS_OPTIONS];

const NAME_COLUMN: ServerColumn<CategoryRow> = {
    key: 'name',
    header: 'Nome',
    sortKey: 'name',
    filter: { type: 'text', key: 'name' },
};

const PRODUCTS_COLUMN: ServerColumn<CategoryRow> = {
    key: 'productsCount',
    header: 'Produtos',
    sortKey: 'products_count',
    render: (row) =>
        createElement(LinkedCount, {
            count: row.productsCount,
            href: row.productsUrl,
            singular: 'produto',
            plural: 'produtos',
        }),
};

const STATUS_COLUMN: ServerColumn<CategoryRow> = {
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

export const CATEGORY_COLUMNS: ServerColumn<CategoryRow>[] = [
    NAME_COLUMN,
    PRODUCTS_COLUMN,
    STATUS_COLUMN,
];

// Plain text in the spreadsheet instead of the link and the badge.
export const CATEGORY_EXPORT_COLUMNS: ServerColumn<CategoryRow>[] = [
    NAME_COLUMN,
    { ...PRODUCTS_COLUMN, render: (row) => String(row.productsCount) },
    { ...STATUS_COLUMN, render: (row) => translateStatus(row.status) },
];

export const CATEGORY_MODAL_TEXT: Record<CategoryModalMode, CategoryModalText> =
    {
        create: {
            title: 'Nova categoria',
            description: 'Preencha os dados abaixo para criar uma categoria.',
            submit: 'Criar',
            success: 'Categoria criada com sucesso.',
        },
        edit: {
            title: 'Editar categoria',
            description: 'Atualize os dados da categoria.',
            submit: 'Salvar',
            success: 'Categoria atualizada com sucesso.',
        },
    };

export const CATEGORY_NAME_PLACEHOLDER = 'Digite o nome da categoria';

export const SAVE_CATEGORY_ERROR = 'Não foi possível salvar a categoria.';

// Mirrors Store/UpdateCategoryRequest.
export const CATEGORY_LIMITS = {
    nameLength: 255,
} as const;
