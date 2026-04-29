import { CategoriesModule } from '@/features/dashboard/categories';
import { PageContent } from '@/features/dashboard/page-content';
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
