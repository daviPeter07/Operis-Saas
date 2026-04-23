import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { PageHeader } from '@/components/features/dashboard/page-header';
import { EmptyState } from '@/components/features/dashboard/empty-state';
import { Tags } from 'lucide-react';

export default function CategoriesPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Categories', href: '/dashboard/categories' }]}>
            <PageContent>
                <PageHeader
                    title="Categories"
                    description="Organize your products into categories."
                    action={{
                        label: 'Add Category',
                        onClick: () => console.log('Add category'),
                    }}
                />
                <EmptyState
                    icon={Tags}
                    title="No categories yet"
                    description="Start by adding categories to organize your products."
                    action={{
                        label: 'Add Category',
                        onClick: () => console.log('Add category'),
                    }}
                />
            </PageContent>
        </AppLayout>
    );
}