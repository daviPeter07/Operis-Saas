import { createElement } from 'react';
import { StatusBadge } from '@/components/common/status-badge';
import type { ServerColumn } from '@/components/table/server-table';
import { ENTITY_STATUS_OPTIONS } from '@/constants/entity-status';
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

export const CATEGORY_COLUMNS: ServerColumn<CategoryRow>[] = [
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
