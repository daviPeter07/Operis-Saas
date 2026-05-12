import { router } from '@inertiajs/react';
import {
    Plus,
    UserPlus,
    TrendingUp,
    ShoppingCart,
    Receipt,
    Tags,
    Building2,
    Sun,
    Moon,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { withAppBasePath } from '@/constants/workspace';
import { useAppearance } from '@/hooks/use-appearance';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

interface QuickActionsButtonProps {
    breadcrumbs?: BreadcrumbItemType[];
}

const quickActions = [
    { key: 'create-client', label: 'Adicionar Cliente', icon: UserPlus },
    { key: 'create-sale', label: 'Adicionar Venda', icon: TrendingUp },
    { key: 'create-purchase', label: 'Adicionar Compra', icon: ShoppingCart },
    { key: 'create-expense', label: 'Adicionar Despesa', icon: Receipt },
    { key: 'create-brand', label: 'Adicionar Marca', icon: Building2 },
    { key: 'create-category', label: 'Adicionar Categoria', icon: Tags },
];

export function AppHeaderWithActions({
    breadcrumbs = [],
}: QuickActionsButtonProps) {
    const { appearance, updateAppearance } = useAppearance();
    const handleAction = (actionKey: string) => {
        const routes: Record<string, string> = {
                'create-client': withAppBasePath(
                    '/dashboard/clients?action=create-client',
                ),
                'create-sale': withAppBasePath('/dashboard/sales?action=create-sale'),
                'create-purchase': withAppBasePath(
                    '/dashboard/purchases?action=create-purchase',
                ),
                'create-expense': withAppBasePath(
                    '/dashboard/accounts-payable?action=create-expense',
                ),
                'create-brand': withAppBasePath('/dashboard/brands?action=create-brand'),
                'create-category': withAppBasePath(
                    '/dashboard/categories?action=create-category',
                ),
        };

        if (routes[actionKey]) {
            router.visit(routes[actionKey]);
        }
    };

    const toggleTheme = () => {
        const newAppearance = appearance === 'dark' ? 'light' : 'dark';
        updateAppearance(newAppearance);
    };

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border bg-sidebar px-6 text-sidebar-foreground transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex-1" />
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="mr-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
                {appearance === 'dark' ? (
                    <Sun className="h-4 w-4" />
                ) : (
                    <Moon className="h-4 w-4" />
                )}
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="sm"
                        className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                    {quickActions.map((action, index) => (
                        <>
                            <DropdownMenuItem
                                key={action.key}
                                className="cursor-pointer"
                                onClick={() => handleAction(action.key)}
                            >
                                <action.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                {action.label}
                            </DropdownMenuItem>
                            {index === 2 && <DropdownMenuSeparator />}
                        </>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
