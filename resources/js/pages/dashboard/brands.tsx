import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { PageHeader } from '@/components/features/dashboard/page-header';
import { EmptyState } from '@/components/features/dashboard/empty-state';
import { Award } from 'lucide-react';

export default function BrandsPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Brands', href: '/dashboard/brands' }]}>
            <PageContent>
                <PageHeader
                    title="Brands"
                    description="Manage your product brands."
                    action={{
                        label: 'Add Brand',
                        onClick: () => console.log('Add brand'),
                    }}
                />
                <EmptyState
                    icon={Award}
                    title="No brands yet"
                    description="Start by adding brands to categorize your products."
                    action={{
                        label: 'Add Brand',
                        onClick: () => console.log('Add brand'),
                    }}
                />
            </PageContent>
        </AppLayout>
    );
}