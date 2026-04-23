import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { QuickActionsModal } from '@/components/features/dashboard/layout/quick-actions-modal';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppHeaderWithActions({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const [quickActionsOpen, setQuickActionsOpen] = useState(false);

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                <div className="flex-1" />
                <Button
                    variant="default"
                    size="sm"
                    onClick={() => setQuickActionsOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Quick Action
                </Button>
            </header>

            <QuickActionsModal
                open={quickActionsOpen}
                onOpenChange={setQuickActionsOpen}
            />
        </>
    );
}