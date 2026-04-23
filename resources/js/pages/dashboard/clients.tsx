import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { PageHeader } from '@/components/features/dashboard/page-header';
import { EmptyState } from '@/components/features/dashboard/empty-state';
import { Users } from 'lucide-react';

export default function ClientsPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Clients', href: '/dashboard/clients' }]}>
            <PageContent>
                <PageHeader
                    title="Clients"
                    description="Manage your client relationships."
                    action={{
                        label: 'Add Client',
                        onClick: () => console.log('Add client'),
                    }}
                />
                <EmptyState
                    icon={Users}
                    title="No clients yet"
                    description="Start by adding your first client to manage relationships."
                    action={{
                        label: 'Add Client',
                        onClick: () => console.log('Add client'),
                    }}
                />
            </PageContent>
        </AppLayout>
    );
}