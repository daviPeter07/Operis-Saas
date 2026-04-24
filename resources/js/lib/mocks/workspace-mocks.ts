import type { WorkspaceSeed, WorkspaceState } from '@/types/workspace';

export const mockWorkspaceSeed: WorkspaceSeed = {
    companies: [
        {
            id: '1',
            name: 'DG Computer',
            slug: 'dg-computer',
            role: 'admin',
            initials: 'DG',
            description: 'Empresa de assistência técnica em informática',
            primaryColor: '#f97316',
            secondaryColor: '#fb923c',
        },
        {
            id: '2',
            name: 'Syncforge',
            slug: 'sync',
            role: 'supervisor',
            initials: 'SF',
            description: 'Criadora de software para empresas',
            primaryColor: '#3b82f6',
            secondaryColor: '#60a5fa',
        },
        {
            id: '3',
            name: 'Atelie Central',
            slug: 'atelie-central',
            role: 'user',
            initials: 'AC',
            description: 'Comércio local com operação enxuta de vendas',
            primaryColor: '#10b981',
            secondaryColor: '#34d399',
        },
    ],
    navigation: [
        {
            key: 'overview',
            label: 'Visão Geral',
            href: '/dashboard',
            status: 'available',
        },
        {
            key: 'clients',
            label: 'Clientes',
            href: '/dashboard/clients',
            status: 'available',
        },
        {
            key: 'sales',
            label: 'Vendas',
            href: '/dashboard/sales',
            status: 'available',
        },
        {
            key: 'suppliers',
            label: 'Fornecedores',
            href: '/dashboard/suppliers',
            status: 'available',
        },
        {
            key: 'categories',
            label: 'Categorias',
            href: '/dashboard/categories',
            status: 'available',
        },
        {
            key: 'brands',
            label: 'Marcas',
            href: '/dashboard/brands',
            status: 'available',
        },
        {
            key: 'inventory',
            label: 'Estoque',
            href: '/dashboard/inventory',
            status: 'available',
        },
        {
            key: 'purchases',
            label: 'Compras',
            href: '/dashboard/purchases',
            status: 'available',
        },
        {
            key: 'accounts-receivable',
            label: 'Contas a Receber',
            href: '/dashboard/accounts-receivable',
            status: 'available',
        },
        {
            key: 'accounts-payable',
            label: 'Contas a Pagar',
            href: '/dashboard/accounts-payable',
            status: 'available',
        },
        {
            key: 'team',
            label: 'Equipe',
            href: '/dashboard/team',
            status: 'available',
        },
        {
            key: 'reports',
            label: 'Relatórios',
            href: '/dashboard/reports',
            status: 'available',
        },
        {
            key: 'settings',
            label: 'Configurações',
            href: '/dashboard/settings',
            status: 'available',
        },
    ],
    quickActions: [
        {
            key: 'create-client',
            label: 'Criar Cliente',
            description: 'Adicione um novo cliente ao workspace',
        },
        {
            key: 'create-sale',
            label: 'Criar Venda',
            description: 'Registre uma nova venda na operação',
        },
        {
            key: 'create-purchase',
            label: 'Criar Compra',
            description: 'Lance uma nova compra ou reposição',
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
    ],
};

export const mockWorkspaceState: WorkspaceState = {
    ...mockWorkspaceSeed,
    currentCompany: mockWorkspaceSeed.companies[0],
};
