import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { PageHeader } from '@/components/features/dashboard/page-header';
import { EmptyState } from '@/components/features/dashboard/empty-state';
import { Package } from 'lucide-react';

export default function ProductsPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Products', href: '/dashboard/products' }]}>
            <PageContent>
                <PageHeader
                    title="Products"
                    description="Manage your product inventory."
                    action={{
                        label: 'Add Product',
                        onClick: () => console.log('Add product'),
                    }}
                />
                <EmptyState
                    icon={Package}
                    title="No products yet"
                    description="Start by adding your first product to manage inventory."
                    action={{
                        label: 'Add Product',
                        onClick: () => console.log('Add product'),
                    }}
                />
            </PageContent>
        </AppLayout>
    );
}