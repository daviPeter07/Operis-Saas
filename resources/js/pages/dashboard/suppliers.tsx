import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { PageHeader } from '@/components/features/dashboard/page-header';
import { EmptyState } from '@/components/features/dashboard/empty-state';
import { Truck } from 'lucide-react';

export default function SuppliersPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Suppliers', href: '/dashboard/suppliers' }]}>
            <PageContent>
                <PageHeader
                    title="Suppliers"
                    description="Manage your supplier relationships."
                    action={{
                        label: 'Add Supplier',
                        onClick: () => console.log('Add supplier'),
                    }}
                />
                <EmptyState
                    icon={Truck}
                    title="No suppliers yet"
                    description="Start by adding your first supplier to manage relationships."
                    action={{
                        label: 'Add Supplier',
                        onClick: () => console.log('Add supplier'),
                    }}
                />
            </PageContent>
        </AppLayout>
    );
}