import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { PageHeader } from '@/components/features/dashboard/page-header';
import { EmptyState } from '@/components/features/dashboard/empty-state';
import { Warehouse } from 'lucide-react';

export default function InventoryPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/dashboard/inventory' }]}>
            <PageContent>
                <PageHeader
                    title="Inventory"
                    description="Track and manage your stock levels."
                    action={{
                        label: 'Adjust Stock',
                        onClick: () => console.log('Adjust stock'),
                    }}
                />
                <EmptyState
                    icon={Warehouse}
                    title="No inventory records"
                    description="Start by adding inventory to track your stock levels."
                    action={{
                        label: 'Adjust Stock',
                        onClick: () => console.log('Adjust stock'),
                    }}
                />
            </PageContent>
        </AppLayout>
    );
}