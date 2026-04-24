export type WorkspaceRole = 'admin' | 'supervisor' | 'user';

export type WorkspaceModuleKey =
    | 'overview'
    | 'clients'
    | 'sales'
    | 'suppliers'
    | 'products'
    | 'categories'
    | 'brands'
    | 'inventory'
    | 'purchases'
    | 'accounts-receivable'
    | 'accounts-payable'
    | 'team'
    | 'reports'
    | 'settings';

export type WorkspaceModuleStatus = 'available' | 'coming-soon';

export type WorkspaceCompany = {
    id: string;
    name: string;
    slug: string;
    role: WorkspaceRole;
    initials: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
};

export type WorkspaceModule = {
    key: WorkspaceModuleKey;
    label: string;
    href: string;
    status: WorkspaceModuleStatus;
};

export type WorkspaceQuickActionKey =
    | 'create-client'
    | 'create-product'
    | 'create-sale'
    | 'create-purchase'
    | 'create-expense'
    | 'create-brand';

export type WorkspaceQuickAction = {
    key: WorkspaceQuickActionKey;
    label: string;
    description: string;
};

export type WorkspaceTeamAccessMode = 'manage' | 'request-admin' | 'view';

export type WorkspaceSeed = {
    companies: WorkspaceCompany[];
    navigation: WorkspaceModule[];
    quickActions: WorkspaceQuickAction[];
};

export type WorkspaceState = WorkspaceSeed & {
    currentCompany: WorkspaceCompany;
};
