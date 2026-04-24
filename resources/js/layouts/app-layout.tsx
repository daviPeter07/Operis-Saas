import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { AppHeaderWithActions } from '@/components/app-header-with-actions';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            <AppHeaderWithActions breadcrumbs={breadcrumbs} />
            {children}
        </AppLayoutTemplate>
    );
}