import { usePage } from '@inertiajs/react';
import { ChevronsUpDown, Building2 } from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { CompanySwitcherModal } from '@/features/dashboard/layout/company-switcher-modal';
import { useWorkspace } from '@/features/dashboard/workspace-context';
import { useIsMobile } from '@/hooks/use-mobile';

export function NavUser() {
    const { auth } = usePage().props;
    const isMobile = useIsMobile();
    const { currentCompany } = useWorkspace();
    const [companySwitcherOpen, setCompanySwitcherOpen] = useState(false);

    if (!auth.user) {
        return null;
    }

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                                data-test="sidebar-menu-button"
                            >
                                <UserInfo user={auth.user} />
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="user-menu w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            align="end"
                            side={isMobile ? 'bottom' : 'right'}
                        >
                            <div className="flex items-center gap-2 px-2 py-1.5">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium">
                                        {currentCompany.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground capitalize">
                                        {currentCompany.role}
                                    </span>
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="muted"
                                className="cursor-pointer"
                                onClick={() => setCompanySwitcherOpen(true)}
                            >
                                Trocar Empresa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>

            <CompanySwitcherModal
                open={companySwitcherOpen}
                onOpenChange={setCompanySwitcherOpen}
            />
        </>
    );
}
