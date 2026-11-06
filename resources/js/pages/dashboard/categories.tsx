import { PageContent } from '@/components/page-content';
import { CategoriesModule } from '@/features/dashboard/categories';
import AppLayout from '@/layouts/app-layout';

export default function CategoriesPage() {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Categorias', href: '/dashboard/categories' },
            ]}
        >
            <PageContent>
                <CategoriesModule />
            </PageContent>
        </AppLayout>
    );
}
