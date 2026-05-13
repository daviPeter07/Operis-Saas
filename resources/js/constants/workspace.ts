import type {
    WorkspaceModule,
    WorkspaceQuickAction,
    WorkspaceRole,
} from '@/types/workspace';

const envBasePath = (import.meta.env.VITE_APP_BASE_PATH as string | undefined) ?? '/operis';
const normalizedBasePath = envBasePath
    ? `/${envBasePath.replace(/^\/+|\/+$/g, '')}`
    : '';

export function withAppBasePath(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${normalizedBasePath}${normalizedPath}`;
}

export const defaultWorkspaceNavigation: WorkspaceModule[] = [
    {
        key: 'overview',
        label: 'Visão Geral',
        href: withAppBasePath('/dashboard'),
        status: 'available',
        shortcut: '1',
    },
    {
        key: 'inventory',
        label: 'Estoque',
        href: withAppBasePath('/dashboard/inventory'),
        status: 'available',
        shortcut: '2',
    },
    {
        key: 'sales',
        label: 'Vendas',
        href: withAppBasePath('/dashboard/sales'),
        status: 'available',
        shortcut: '3',
    },
    {
        key: 'purchases',
        label: 'Compras',
        href: withAppBasePath('/dashboard/purchases'),
        status: 'available',
        shortcut: '4',
    },
    {
        key: 'clients',
        label: 'Clientes',
        href: withAppBasePath('/dashboard/clients'),
        status: 'available',
        shortcut: '5',
    },
    {
        key: 'suppliers',
        label: 'Fornecedores',
        href: withAppBasePath('/dashboard/suppliers'),
        status: 'available',
        shortcut: '6',
    },
    {
        key: 'brands',
        label: 'Marcas',
        href: withAppBasePath('/dashboard/brands'),
        status: 'available',
        shortcut: '7',
    },
    {
        key: 'categories',
        label: 'Categorias',
        href: withAppBasePath('/dashboard/categories'),
        status: 'available',
        shortcut: '8',
    },
    {
        key: 'accounts-receivable',
        label: 'Contas a Receber',
        href: withAppBasePath('/dashboard/accounts-receivable'),
        status: 'available',
        shortcut: '9',
    },
    {
        key: 'accounts-payable',
        label: 'Contas a Pagar',
        href: withAppBasePath('/dashboard/accounts-payable'),
        status: 'available',
        shortcut: '0',
    },
    {
        key: 'team',
        label: 'Equipe',
        href: withAppBasePath('/dashboard/team'),
        status: 'available',
    },
    {
        key: 'reports',
        label: 'Relatórios',
        href: withAppBasePath('/dashboard/reports'),
        status: 'available',
    },
    {
        key: 'settings',
        label: 'Configurações',
        href: withAppBasePath('/dashboard/settings'),
        status: 'available',
    },
];

export const defaultWorkspaceQuickActions: WorkspaceQuickAction[] = [
    {
        key: 'create-client',
        label: 'Criar Cliente',
        description: 'Adicione um novo cliente ao workspace',
    },
    {
        key: 'create-sale',
        label: 'Criar Venda',
        description: 'Registre uma nova venda na operaÃ§Ã£o',
    },
    {
        key: 'create-purchase',
        label: 'Criar Compra',
        description: 'Lance uma nova compra ou reposiÃ§Ã£o',
    },
    {
        key: 'create-expense',
        label: 'Criar Despesa',
        description: 'Adicione uma nova despesa da empresa',
    },
    {
        key: 'create-brand',
        label: 'Criar Marca',
        description: 'Cadastre uma nova marca no sistema',
    },
];

export const defaultWorkspaceRole: WorkspaceRole = 'admin';
