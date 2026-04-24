import { BrandsModule } from '@/components/features/dashboard/brands';
import { PageContent } from '@/components/features/dashboard/page-content';
import AppLayout from '@/layouts/app-layout';

export default function BrandsPage() {
    return (
        <AppLayout
            breadcrumbs={[{ title: 'Marcas', href: '/dashboard/brands' }]}
        >
            <PageContent>
                <BrandsModule />
            </PageContent>
        </AppLayout>
    );
}
