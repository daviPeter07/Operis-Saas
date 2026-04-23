import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    Users,
    TrendingUp,
    Truck,
    Package,
    Tags,
    Award,
    Warehouse,
    ShoppingCart,
    CreditCard,
    Receipt,
    UsersRound,
    BarChart3,
    Settings,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

const navItems = [
    {
        title: 'Visão Geral',
        href: '/dashboard',
        icon: LayoutGrid,
        module: 'overview',
    },
    {
        title: 'Clientes',
        href: '/dashboard/clients',
        icon: Users,
        module: 'clients',
    },
    {
        title: 'Vendas',
        href: '/dashboard/sales',
        icon: TrendingUp,
        module: 'sales',
    },
    {
        title: 'Fornecedores',
        href: '/dashboard/suppliers',
        icon: Truck,
        module: 'suppliers',
    },
    {
        title: 'Produtos',
        href: '/dashboard/products',
        icon: Package,
        module: 'products',
    },
    {
        title: 'Categorias',
        href: '/dashboard/categories',
        icon: Tags,
        module: 'categories',
    },
    {
        title: 'Marcas',
        href: '/dashboard/brands',
        icon: Award,
        module: 'brands',
    },
    {
        title: 'Estoque',
        href: '/dashboard/inventory',
        icon: Warehouse,
        module: 'inventory',
    },
    {
        title: 'Compras',
        href: '/dashboard/purchases',
        icon: ShoppingCart,
        module: 'purchases',
    },
    {
        title: 'Contas a Receber',
        href: '/dashboard/accounts-receivable',
        icon: CreditCard,
        module: 'accounts-receivable',
    },
    {
        title: 'Contas a Pagar',
        href: '/dashboard/accounts-payable',
        icon: Receipt,
        module: 'accounts-payable',
    },
    {
        title: 'Equipe',
        href: '/dashboard/team',
        icon: UsersRound,
        module: 'team',
    },
    {
        title: 'Relatórios',
        href: '/dashboard/reports',
        icon: BarChart3,
        module: 'reports',
    },
    {
        title: 'Configurações',
        href: '/dashboard/settings',
        icon: Settings,
        module: 'settings',
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <div className="h-px mx-3 bg-linear-to-r from-transparent via-accent/50 to-transparent" />

            <SidebarContent>
                <nav className="flex flex-col gap-1 px-3">
                    {navItems.map((item) => {
                        const isActive = item.href === location.pathname;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.module}
                                href={item.href}
                                prefetch
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'text-accent'
                                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                                } `}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span className="truncate">{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
