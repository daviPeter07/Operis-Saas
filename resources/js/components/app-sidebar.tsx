import { Link, router } from '@inertiajs/react';
import * as React from 'react';
import {
    LayoutGrid,
    Users,
    TrendingUp,
    Truck,
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
import { useWorkspace } from '@/features/dashboard/workspace-context';
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
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    getAltShortcutLabel,
    isEditableElement,
} from '@/lib/keyboard-shortcuts';

const navItems = [
    {
        title: 'Visão Geral',
        href: '/dashboard',
        icon: LayoutGrid,
        module: 'overview',
        shortcut: '1',
        description: 'Acompanhe indicadores, alertas e atividades recentes.',
    },
    {
        title: 'Clientes',
        href: '/dashboard/clients',
        icon: Users,
        module: 'clients',
        shortcut: '2',
        description:
            'Gerencie clientes e acompanhe o relacionamento comercial.',
    },
    {
        title: 'Vendas',
        href: '/dashboard/sales',
        icon: TrendingUp,
        module: 'sales',
        shortcut: '3',
        description: 'Visualize vendas, pedidos e desempenho comercial.',
    },
    {
        title: 'Fornecedores',
        href: '/dashboard/suppliers',
        icon: Truck,
        module: 'suppliers',
        shortcut: '4',
        description: 'Organize fornecedores e histórico de abastecimento.',
    },
    {
        title: 'Categorias',
        href: '/dashboard/categories',
        icon: Tags,
        module: 'categories',
        shortcut: '5',
        description: 'Agrupe produtos por categorias para facilitar a gestão.',
    },
    {
        title: 'Marcas',
        href: '/dashboard/brands',
        icon: Award,
        module: 'brands',
        shortcut: '6',
        description: 'Gerencie marcas vinculadas ao catálogo da operação.',
    },
    {
        title: 'Estoque',
        href: '/dashboard/inventory',
        icon: Warehouse,
        module: 'inventory',
        shortcut: '7',
        description: 'Monitore estoque, entradas, saídas e rupturas.',
    },
    {
        title: 'Compras',
        href: '/dashboard/purchases',
        icon: ShoppingCart,
        module: 'purchases',
        shortcut: '8',
        description: 'Controle compras e acompanhe pedidos de reposição.',
    },
    {
        title: 'Contas a Receber',
        href: '/dashboard/accounts-receivable',
        icon: CreditCard,
        module: 'accounts-receivable',
        shortcut: '9',
        description: 'Veja recebimentos pendentes e valores a receber.',
    },
    {
        title: 'Contas a Pagar',
        href: '/dashboard/accounts-payable',
        icon: Receipt,
        module: 'accounts-payable',
        shortcut: '0',
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

    const navigationShortcuts = React.useMemo(() => {
        return new Map(
            navItems
                .filter((navItem) => navItem.shortcut)
                .map((navItem) => [navItem.shortcut as string, navItem]),
        );
    }, []);

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const shortcutKeys = [
                '0',
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
            ];

            if (
                !event.altKey ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                !shortcutKeys.includes(event.key)
            ) {
                return;
            }

            if (isEditableElement(event.target)) {
                return;
            }

            const targetItem = navigationShortcuts.get(event.key);

            if (!targetItem) {
                return;
            }

            event.preventDefault();
            router.visit(targetItem.href);
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigationShortcuts]);

    const renderShortcutBadge = (shortcut?: string) => {
        if (!shortcut) {
            return null;
        }

        return (
            <Badge
                variant="outline"
                className="pointer-events-none absolute top-1/2 right-2 h-5 min-w-5 -translate-y-1/2 rounded-md border-sidebar-border bg-sidebar px-1.5 text-[10px] font-semibold text-sidebar-foreground shadow-none group-data-[collapsible=icon]:top-1 group-data-[collapsible=icon]:right-1 group-data-[collapsible=icon]:translate-y-0"
            >
                {getAltShortcutLabel(shortcut)}
            </Badge>
        );
    };

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
                                        <SidebarMenuItem className="relative list-none marker:content-none">
                                            <Link
                                                href={item.href}
                                                prefetch
                                                className={`relative flex items-center gap-3 rounded-xl px-3 py-2 pr-9 text-sm font-medium transition-all duration-200 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pr-0 ${
                                                    isActive
                                                        ? 'bg-sidebar-accent text-accent shadow-[0_0_0_1px_hsl(var(--sidebar-border))]'
                                                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground hover:shadow-[0_10px_24px_-18px_rgba(0,0,0,0.9)]'
                                                } `}
                                            >
                                                <Icon className="h-4 w-4 shrink-0" />
                                                <span className="truncate group-data-[collapsible=icon]:hidden">
                                                    {item.title}
                                                </span>
                                                {renderShortcutBadge(
                                                    item.shortcut,
                                                )}
                                            </Link>
                                        </SidebarMenuItem>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        align="center"
                                        className="max-w-64 rounded-xl border border-sidebar-border bg-sidebar px-3 py-2 text-sidebar-foreground shadow-xl"
                                    >
                                        <p className="text-sm font-semibold text-sidebar-foreground">
                                            {item.title}
                                        </p>
                                        {item.shortcut && (
                                            <p className="mt-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                                                Atalho{' '}
                                                {getAltShortcutLabel(
                                                    item.shortcut,
                                                )}
                                            </p>
                                        )}
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
