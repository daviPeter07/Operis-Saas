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
import { useWorkspace } from '@/components/features/dashboard/workspace-context';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
    {
        title: 'Visão Geral',
        href: '/dashboard',
        icon: LayoutGrid,
        module: 'overview',
        description: 'Acompanhe indicadores, alertas e atividades recentes.',
    },
    {
        title: 'Clientes',
        href: '/dashboard/clients',
        icon: Users,
        module: 'clients',
        description:
            'Gerencie clientes e acompanhe o relacionamento comercial.',
    },
    {
        title: 'Vendas',
        href: '/dashboard/sales',
        icon: TrendingUp,
        module: 'sales',
        description: 'Visualize vendas, pedidos e desempenho comercial.',
    },
    {
        title: 'Fornecedores',
        href: '/dashboard/suppliers',
        icon: Truck,
        module: 'suppliers',
        description: 'Organize fornecedores e histórico de abastecimento.',
    },
    {
        title: 'Categorias',
        href: '/dashboard/categories',
        icon: Tags,
        module: 'categories',
        description: 'Agrupe produtos por categorias para facilitar a gestão.',
    },
    {
        title: 'Marcas',
        href: '/dashboard/brands',
        icon: Award,
        module: 'brands',
        description: 'Gerencie marcas vinculadas ao catálogo da operação.',
    },
    {
        title: 'Estoque',
        href: '/dashboard/inventory',
        icon: Warehouse,
        module: 'inventory',
        description: 'Monitore estoque, entradas, saídas e rupturas.',
    },
    {
        title: 'Compras',
        href: '/dashboard/purchases',
        icon: ShoppingCart,
        module: 'purchases',
        description: 'Controle compras e acompanhe pedidos de reposição.',
    },
    {
        title: 'Contas a Receber',
        href: '/dashboard/accounts-receivable',
        icon: CreditCard,
        module: 'accounts-receivable',
        description: 'Veja recebimentos pendentes e valores a receber.',
    },
    {
        title: 'Contas a Pagar',
        href: '/dashboard/accounts-payable',
        icon: Receipt,
        module: 'accounts-payable',
        description: 'Acompanhe despesas, contas e pagamentos pendentes.',
    },
    {
        title: 'Equipe',
        href: '/dashboard/team',
        icon: UsersRound,
        module: 'team',
        description: 'Consulte a equipe e acompanhe responsabilidades.',
    },
    {
        title: 'Relatórios',
        href: '/dashboard/reports',
        icon: BarChart3,
        module: 'reports',
        description: 'Analise relatórios operacionais e financeiros.',
    },
    {
        title: 'Configurações',
        href: '/dashboard/settings',
        icon: Settings,
        module: 'settings',
        description: 'Ajuste preferências e configurações da empresa.',
    },
];

export function AppSidebar() {
    const { navigation } = useWorkspace();

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

            <div className="mx-3 h-px bg-linear-to-r from-transparent via-accent/50 to-transparent" />

            <SidebarContent>
                <TooltipProvider>
                    <nav className="flex flex-col gap-1 px-3 group-data-[collapsible=icon]:gap-0.5">
                        {navigation.map((navigationItem) => {
                            const item = navItems.find(
                                (navItem) =>
                                    navItem.module === navigationItem.key,
                            );

                            if (!item) {
                                return null;
                            }

                            const isActive = item.href === location.pathname;
                            const Icon = item.icon;

                            return (
                                <Tooltip key={item.module}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={item.href}
                                            prefetch
                                            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 ${
                                                isActive
                                                    ? 'bg-sidebar-accent text-accent shadow-[0_0_0_1px_hsl(var(--sidebar-border))]'
                                                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground hover:shadow-[0_10px_24px_-18px_rgba(0,0,0,0.9)]'
                                            } `}
                                        >
                                            <Icon className="h-4 w-4 shrink-0" />
                                            <span className="truncate group-data-[collapsible=icon]:hidden">
                                                {item.title}
                                            </span>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        align="center"
                                        className="max-w-64 rounded-xl border border-sidebar-border bg-sidebar px-3 py-2 text-sidebar-foreground shadow-xl"
                                    >
                                        <p className="text-sm font-semibold text-sidebar-foreground">
                                            {item.title}
                                        </p>
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </nav>
                </TooltipProvider>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
