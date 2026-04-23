import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { PageHeader } from '@/components/features/dashboard/page-header';
import { EmptyState } from '@/components/features/dashboard/empty-state';
import { TrendingUp } from 'lucide-react';

export default function SalesPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Sales', href: '/dashboard/sales' }]}>
            <PageContent>
                <PageHeader
                    title="Sales"
                    description="Track and manage sales performance."
                    action={{
                        label: 'Add Sale',
                        onClick: () => console.log('Add sale'),
                    }}
                />
                <EmptyState
                    icon={TrendingUp}
                    title="No sales yet"
                    description="Start by recording your first sale to track performance."
                    action={{
                        label: 'Add Sale',
                        onClick: () => console.log('Add sale'),
                    }}
                />
            </PageContent>
        </AppLayout>
    );
}