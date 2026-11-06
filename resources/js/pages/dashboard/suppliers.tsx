import { PageContent } from '@/components/page-content';
import { SuppliersModule } from '@/features/dashboard/suppliers';
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
