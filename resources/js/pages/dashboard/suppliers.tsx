import { PageContent } from '@/components/features/dashboard/page-content';
import { SuppliersModule } from '@/components/features/dashboard/suppliers';
import AppLayout from '@/layouts/app-layout';

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
