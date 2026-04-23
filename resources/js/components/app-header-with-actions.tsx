import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, UserPlus, Package, TrendingUp, ShoppingCart, Receipt, Tags, Building2 } from 'lucide-react';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

interface QuickActionsButtonProps {
    breadcrumbs?: BreadcrumbItemType[];
}

const quickActions = [
    { key: 'create-client', label: 'Adicionar Cliente', icon: UserPlus },
    { key: 'create-product', label: 'Adicionar Produto', icon: Package },
    { key: 'create-sale', label: 'Adicionar Venda', icon: TrendingUp },
    { key: 'create-purchase', label: 'Adicionar Compra', icon: ShoppingCart },
    { key: 'create-expense', label: 'Adicionar Despesa', icon: Receipt },
    { key: 'create-brand', label: 'Adicionar Marca', icon: Building2 },
    { key: 'create-category', label: 'Adicionar Categoria', icon: Tags },
];

export function AppHeaderWithActions({
    breadcrumbs = [],
}: QuickActionsButtonProps) {
    const handleAction = (actionKey: string) => {
        console.log('Quick action:', actionKey);
    };

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex-1" />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
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
