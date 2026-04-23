import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { PageHeader } from '@/components/features/dashboard/page-header';

export default function DashboardPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <PageContent>
                <PageHeader
                    title="Dashboard"
                    description="Welcome back! Here's an overview of your business."
                />
                <div className="grid gap-6">
                    <div className="text-muted-foreground">
                        Overview content coming soon...
                    </div>
                </div>
            </PageContent>
        </AppLayout>
    );
}