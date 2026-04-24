import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { SuppliersModule } from '@/components/features/dashboard/suppliers';

export default function SuppliersPage() {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Fornecedores', href: '/dashboard/suppliers' },
            ]}
        >
            <PageContent>
                <SuppliersModule />
            </PageContent>
        </AppLayout>
    );
}
