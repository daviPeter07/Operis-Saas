import { PageContent } from '@/components/page-content';
import { BrandsModule } from '@/features/dashboard/brands';
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
