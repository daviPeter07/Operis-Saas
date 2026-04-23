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
    Building2,
    Plus,
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import { CompanySwitcherModal } from '@/components/features/dashboard/layout/company-switcher-modal';
import { QuickActionsModal } from '@/components/features/dashboard/layout/quick-actions-modal';
import { useWorkspace } from '@/components/features/dashboard/workspace-context';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';

const navItems = [
    {
        title: 'Overview',
        href: '/dashboard',
        icon: LayoutGrid,
        module: 'overview',
    },
    {
        title: 'Clients',
        href: '/dashboard/clients',
        icon: Users,
        module: 'clients',
    },
    {
        title: 'Sales',
        href: '/dashboard/sales',
        icon: TrendingUp,
        module: 'sales',
    },
    {
        title: 'Suppliers',
        href: '/dashboard/suppliers',
        icon: Truck,
        module: 'suppliers',
    },
    {
        title: 'Products',
        href: '/dashboard/products',
        icon: Package,
        module: 'products',
    },
    {
        title: 'Categories',
        href: '/dashboard/categories',
        icon: Tags,
        module: 'categories',
    },
    {
        title: 'Brands',
        href: '/dashboard/brands',
        icon: Award,
        module: 'brands',
    },
    {
        title: 'Inventory',
        href: '/dashboard/inventory',
        icon: Warehouse,
        module: 'inventory',
    },
    {
        title: 'Purchases',
        href: '/dashboard/purchases',
        icon: ShoppingCart,
        module: 'purchases',
    },
    {
        title: 'Accounts Receivable',
        href: '/dashboard/accounts-receivable',
        icon: CreditCard,
        module: 'accounts-receivable',
    },
    {
        title: 'Accounts Payable',
        href: '/dashboard/accounts-payable',
        icon: Receipt,
        module: 'accounts-payable',
    },
    {
        title: 'Team',
        href: '/dashboard/team',
        icon: UsersRound,
        module: 'team',
    },
    {
        title: 'Reports',
        href: '/dashboard/reports',
        icon: BarChart3,
        module: 'reports',
    },
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
        module: 'settings',
    },
];

export function AppSidebar() {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { currentCompany } = useWorkspace();
    const [companySwitcherOpen, setCompanySwitcherOpen] = useState(false);
    const [quickActionsOpen, setQuickActionsOpen] = useState(false);

    return (
        <>
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

                <SidebarContent>
                    <div className="px-3 py-2">
                        <Button
                            variant="ghost"
                            className="h-auto w-full justify-start gap-2 px-3 py-2"
                            onClick={() => setCompanySwitcherOpen(true)}
                        >
                            <Building2 className="h-4 w-4" />
                            <div className="flex min-w-0 flex-1 flex-col items-start">
                                <span className="w-full truncate text-xs font-medium">
                                    {currentCompany.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground capitalize">
                                    {currentCompany.role}
                                </span>
                            </div>
                        </Button>
                    </div>

                    <div className="px-3 py-2">
                        <Button
                            variant="default"
                            size="sm"
                            className="w-full gap-2"
                            onClick={() => setQuickActionsOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Quick Action
                        </Button>
                    </div>

                    <nav className="flex flex-col gap-1 px-3">
                        {navItems.map((item) => {
                            const isActive =
                                item.href === '/dashboard'
                                    ? isCurrentOrParentUrl(item.href) &&
                                      item.href === '/dashboard'
                                    : isCurrentOrParentUrl(item.href);
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.module}
                                    href={item.href}
                                    prefetch
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-accent/10 text-accent ring-2 ring-accent'
                                            : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                                    } `}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span className="truncate">
                                        {item.title}
                                    </span>
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

            <CompanySwitcherModal
                open={companySwitcherOpen}
                onOpenChange={setCompanySwitcherOpen}
            />
            <QuickActionsModal
                open={quickActionsOpen}
                onOpenChange={setQuickActionsOpen}
            />
        </>
    );
}
