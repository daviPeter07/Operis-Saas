import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { ProductsModule } from '@/components/features/dashboard/products';

export default function ProductsPage() {
    return (
        <AppLayout
            breadcrumbs={[{ title: 'Produtos', href: '/dashboard/products' }]}
        >
            <PageContent>
                <ProductsModule />
            </PageContent>
        </AppLayout>
    );
}
