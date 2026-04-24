import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { WorkspaceProvider } from '@/components/features/dashboard/workspace-context';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
}: AppLayoutProps) {
    return (
        <WorkspaceProvider>
            <AppShell variant="sidebar">
                <AppSidebar />
                <AppContent variant="sidebar" className="overflow-x-hidden">
                    {children}
                </AppContent>
            </AppShell>
        </WorkspaceProvider>
    );
}