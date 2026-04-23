import type { WorkspaceSeed, WorkspaceState } from '@/types/workspace';

export const mockWorkspaceSeed: WorkspaceSeed = {
    companies: [
        {
            id: '1',
            name: 'Dg Computer',
            slug: 'dg-computer',
            role: 'admin',
            initials: 'DG',
            description: 'Empresa de assistência técnica em informática',
            primaryColor: '#3B82F6',
            secondaryColor: '#60A5FA',
        },
        {
            id: '2',
            name: 'Syncforge',
            slug: 'sync',
            role: 'supervisor',
            initials: 'SF',
            description: 'Criadora de software para empresas',
            primaryColor: '#8B5CF6',
            secondaryColor: '#A78BFA',
        },
    ],
    navigation: [
        { key: 'overview', label: 'Overview', href: '/dashboard', status: 'available' },
        { key: 'clients', label: 'Clients', href: '/dashboard/clients', status: 'available' },
        { key: 'sales', label: 'Sales', href: '/dashboard/sales', status: 'available' },
        { key: 'suppliers', label: 'Suppliers', href: '/dashboard/suppliers', status: 'available' },
        { key: 'products', label: 'Products', href: '/dashboard/products', status: 'available' },
        { key: 'categories', label: 'Categories', href: '/dashboard/categories', status: 'available' },
        { key: 'brands', label: 'Brands', href: '/dashboard/brands', status: 'available' },
        { key: 'inventory', label: 'Inventory', href: '/dashboard/inventory', status: 'available' },
        { key: 'purchases', label: 'Purchases', href: '/dashboard/purchases', status: 'available' },
        { key: 'accounts-receivable', label: 'Accounts Receivable', href: '/dashboard/accounts-receivable', status: 'available' },
        { key: 'accounts-payable', label: 'Accounts Payable', href: '/dashboard/accounts-payable', status: 'available' },
        { key: 'team', label: 'Team', href: '/dashboard/team', status: 'available' },
        { key: 'reports', label: 'Reports', href: '/dashboard/reports', status: 'available' },
        { key: 'settings', label: 'Settings', href: '/dashboard/settings', status: 'available' },
    ],
    quickActions: [
        { key: 'create-client', label: 'Create Client', description: 'Add a new client to your workspace' },
        { key: 'create-product', label: 'Create Product', description: 'Add a new product to your catalog' },
        { key: 'create-sale', label: 'Create Sale', description: 'Record a new sale transaction' },
        { key: 'create-purchase', label: 'Create Purchase', description: 'Record a new purchase order' },
        { key: 'create-expense', label: 'Create Expense', description: 'Log a new expense' },
        { key: 'create-brand', label: 'Create Brand', description: 'Add a new brand to your portfolio' },
    ],
};

export const mockWorkspaceState: WorkspaceState = {
    ...mockWorkspaceSeed,
    currentCompany: mockWorkspaceSeed.companies[0],
};
