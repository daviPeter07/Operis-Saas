import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { CategoriesModule } from '@/components/features/dashboard/categories';

export default function CategoriesPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Categories', href: '/dashboard/categories' }]}>
            <PageContent>
                <CategoriesModule />
            </PageContent>
        </AppLayout>
    );
}