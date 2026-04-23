import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { PageHeader } from '@/components/features/dashboard/page-header';
import { EmptyState } from '@/components/features/dashboard/empty-state';
import { ShoppingCart } from 'lucide-react';

export default function PurchasesPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Purchases', href: '/dashboard/purchases' }]}>
            <PageContent>
                <PageHeader
                    title="Purchases"
                    description="Track and manage purchase orders."
                    action={{
                        label: 'Create Purchase',
                        onClick: () => console.log('Create purchase'),
                    }}
                />
                <EmptyState
                    icon={ShoppingCart}
                    title="No purchases yet"
                    description="Start by creating your first purchase order."
                    action={{
                        label: 'Create Purchase',
                        onClick: () => console.log('Create purchase'),
                    }}
                />
            </PageContent>
        </AppLayout>
    );
}