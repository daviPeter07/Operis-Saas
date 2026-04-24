import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { BrandsModule } from '@/components/features/dashboard/brands';

export default function BrandsPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Marcas', href: '/dashboard/brands' }]}>
            <PageContent>
                <BrandsModule />
            </PageContent>
        </AppLayout>
    );
}