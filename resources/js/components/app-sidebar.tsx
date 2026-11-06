import { Link, router } from '@inertiajs/react';
import {
    Award,
    BarChart3,
    ChevronDown,
    CreditCard,
    LayoutGrid,
    Receipt,
    Settings,
    ShoppingCart,
    Tags,
    TrendingUp,
    Truck,
    Users,
    UsersRound,
    Loader2,
    Warehouse,
} from 'lucide-react';
import * as React from 'react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import { Badge } from '@/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { WORKSPACE_GROUP_LABELS, withAppBasePath } from '@/constants/workspace';
import { useWorkspace } from '@/features/dashboard/workspace-context';
import {
    getAltShortcutLabel,
    isEditableElement,
} from '@/lib/keyboard-shortcuts';
import type {
    WorkspaceModule,
    WorkspaceModuleGroup,
    WorkspaceModuleKey,
} from '@/types/workspace';

const navMetaByModule: Record<
    WorkspaceModuleKey,
    {
        icon: React.ComponentType<{ className?: string }>;
        description: string;
    }
> = {
    overview: {
        icon: LayoutGrid,
        description: 'Acompanhe indicadores, alertas e atividades recentes.',
    },
    inventory: {
        icon: Warehouse,
        description: 'Monitore estoque, entradas, saídas e rupturas.',
    },
    sales: {
        icon: TrendingUp,
        description: 'Visualize vendas, pedidos e desempenho comercial.',
    },
    purchases: {
        icon: ShoppingCart,
        description: 'Controle compras e acompanhe pedidos de reposição.',
    },
    clients: {
        icon: Users,
        description:
            'Gerencie clientes e acompanhe o relacionamento comercial.',
    },
    suppliers: {
        icon: Truck,
        description: 'Organize fornecedores e histórico de abastecimento.',
    },
    brands: {
        icon: Award,
        description: 'Gerencie marcas vinculadas ao catálogo da operação.',
    },
    categories: {
        icon: Tags,
        description: 'Agrupe produtos por categorias para facilitar a gestão.',
    },
    'accounts-receivable': {
        icon: CreditCard,
        description: 'Veja recebimentos pendentes e valores a receber.',
    },
    'accounts-payable': {
        icon: Receipt,
        description: 'Acompanhe despesas, contas e pagamentos pendentes.',
    },
    team: {
        icon: UsersRound,
        description: 'Consulte a equipe e acompanhe responsabilidades.',
    },
    reports: {
        icon: BarChart3,
        description: 'Analise relatórios operacionais e financeiros.',
    },
    settings: {
        icon: Settings,
        description: 'Ajuste preferências e configurações da empresa.',
    },
};

/** Path of the page being loaded after a navigation click, so the item can show progress. */
function usePendingNavigationPath(): string | null {
    const [pendingPath, setPendingPath] = React.useState<string | null>(null);

    React.useEffect(() => {
        // Links prefetch on hover; only real clicks should show the spinner.
        const stopStart = router.on('start', (event) => {
            if (!event.detail.visit.prefetch) {
                setPendingPath(event.detail.visit.url.pathname);
            }
        });
        const stopFinish = router.on('finish', (event) => {
            if (!event.detail.visit.prefetch) {
                setPendingPath(null);
            }
        });

        return () => {
            stopStart();
            stopFinish();
        };
    }, []);

    return pendingPath;
}

const OPEN_GROUPS_STORAGE_KEY = 'operis:sidebar-groups';

type OpenGroups = Partial<Record<WorkspaceModuleGroup, boolean>>;

type NavigationSection = {
    group?: WorkspaceModuleGroup;
    items: WorkspaceModule[];
};

function readOpenGroups(): OpenGroups {
    try {
        return JSON.parse(
            window.localStorage.getItem(OPEN_GROUPS_STORAGE_KEY) ?? '{}',
        ) as OpenGroups;
    } catch {
        return {};
    }
}

function saveOpenGroups(openGroups: OpenGroups): void {
    try {
        window.localStorage.setItem(
            OPEN_GROUPS_STORAGE_KEY,
            JSON.stringify(openGroups),
        );
    } catch {
        // Private windows may block storage; the group just won't be remembered.
    }
}

/** Consecutive items with the same group become one section. */
function groupNavigation(navigation: WorkspaceModule[]): NavigationSection[] {
    return navigation.reduce<NavigationSection[]>((sections, item) => {
        const last = sections.at(-1);

        if (last && last.group === item.group) {
            last.items.push(item);
        } else {
            sections.push({ group: item.group, items: [item] });
        }

        return sections;
    }, []);
}

export function AppSidebar() {
    const { navigation } = useWorkspace();
    const { isMobile, setOpenMobile, state } = useSidebar();
    const [openGroups, setOpenGroups] = React.useState(readOpenGroups);

    const toggleGroup = (group: WorkspaceModuleGroup, open: boolean) => {
        const next = { ...openGroups, [group]: open };

        setOpenGroups(next);
        saveOpenGroups(next);
    };
    const pendingPath = usePendingNavigationPath();

    const navigationShortcuts = React.useMemo(() => {
        return new Map(
            navigation
                .filter((navigationItem) => navigationItem.shortcut)
                .map((navigationItem) => [
                    navigationItem.shortcut as string,
                    navigationItem,
                ]),
        );
    }, [navigation]);

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
        if (!shortcut || isMobile) {
            return null;
        }

        return (
            <Badge
                variant="outline"
                className="pointer-events-none absolute top-1/2 right-2 h-5 min-w-5 -translate-y-1/2 rounded-md border-sidebar-border bg-sidebar px-1.5 text-[10px] font-semibold text-sidebar-foreground shadow-none group-data-[collapsible=icon]:hidden"
            >
                {getAltShortcutLabel(shortcut)}
            </Badge>
        );
    };

    const isActivePath = (href: string) =>
        href === location.pathname ||
        // Inner pages (e.g. a product's details) keep their module highlighted.
        (href !== withAppBasePath('/dashboard') &&
            location.pathname.startsWith(`${href}/`));

    const navigationSections = groupNavigation(navigation);

    const renderNavigationItem = (navigationItem: WorkspaceModule) => {
        const meta = navMetaByModule[navigationItem.key];

        if (!meta) {
            return null;
        }

        const isPending =
            pendingPath === navigationItem.href &&
            pendingPath !== location.pathname;
        const isActive = isActivePath(navigationItem.href) || isPending;
        const Icon = meta.icon;

        return (
            <Tooltip key={navigationItem.key}>
                <TooltipTrigger asChild>
                    <SidebarMenuItem className="relative list-none marker:content-none">
                        <Link
                            href={navigationItem.href}
                            prefetch
                            aria-busy={isPending}
                            onClick={() => {
                                if (isMobile) {
                                    setOpenMobile(false);
                                }
                            }}
                            className={`relative flex items-center gap-3 rounded-xl px-3 py-2 pr-9 text-sm font-medium transition-all duration-200 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pr-0 ${
                                isActive
                                    ? 'bg-sidebar-accent text-accent shadow-[0_0_0_1px_hsl(var(--sidebar-border))]'
                                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground hover:shadow-[0_10px_24px_-18px_rgba(0,0,0,0.9)]'
                            } `}
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                            ) : (
                                <Icon className="h-4 w-4 shrink-0" />
                            )}
                            <span className="truncate group-data-[collapsible=icon]:hidden">
                                {navigationItem.label}
                            </span>
                            {!isPending &&
                                renderShortcutBadge(navigationItem.shortcut)}
                        </Link>
                    </SidebarMenuItem>
                </TooltipTrigger>
                <TooltipContent
                    hidden={isMobile}
                    side="right"
                    align="center"
                    className="max-w-64 rounded-xl border border-sidebar-border bg-sidebar px-3 py-2 text-sidebar-foreground shadow-xl"
                >
                    <p className="text-sm font-semibold text-sidebar-foreground">
                        {navigationItem.label}
                    </p>
                    {navigationItem.shortcut && (
                        <p className="mt-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                            Atalho{' '}
                            {getAltShortcutLabel(navigationItem.shortcut)}
                        </p>
                    )}
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {meta.description}
                    </p>
                </TooltipContent>
            </Tooltip>
        );
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={withAppBasePath('/dashboard')} prefetch>
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
                        {navigationSections.map((section, index) => {
                            if (!section.group) {
                                return (
                                    <React.Fragment key={`section-${index}`}>
                                        {index > 0 ? (
                                            <div className="mx-3 my-2 h-px bg-sidebar-border group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-6" />
                                        ) : null}
                                        {section.items.map(
                                            renderNavigationItem,
                                        )}
                                    </React.Fragment>
                                );
                            }

                            const group = section.group;
                            const hasActiveItem = section.items.some((item) =>
                                isActivePath(item.href),
                            );
                            // With the sidebar reduced to icons the group always shows its icons.
                            const isOpen =
                                state === 'collapsed' ||
                                (openGroups[group] ?? true);

                            return (
                                <Collapsible
                                    key={group}
                                    open={isOpen}
                                    onOpenChange={(open) =>
                                        toggleGroup(group, open)
                                    }
                                    className="flex flex-col gap-1 group-data-[collapsible=icon]:gap-0.5"
                                >
                                    <div className="mx-auto my-2 hidden h-px w-6 bg-sidebar-border group-data-[collapsible=icon]:block" />
                                    <CollapsibleTrigger
                                        className={`mt-2 flex cursor-pointer items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium outline-none group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring ${
                                            hasActiveItem && !isOpen
                                                ? 'text-accent'
                                                : 'text-muted-foreground'
                                        }`}
                                    >
                                        {WORKSPACE_GROUP_LABELS[group]}
                                        <ChevronDown
                                            aria-hidden
                                            className={`size-3.5 transition-transform duration-200 ${
                                                isOpen ? '' : '-rotate-90'
                                            }`}
                                        />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="flex flex-col gap-1 overflow-hidden group-data-[collapsible=icon]:gap-0.5 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                        {section.items.map(
                                            renderNavigationItem,
                                        )}
                                    </CollapsibleContent>
                                </Collapsible>
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
