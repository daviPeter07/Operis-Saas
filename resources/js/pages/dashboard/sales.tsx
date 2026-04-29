import { PageContent } from '@/features/dashboard/page-content';
import { SalesModule } from '@/features/dashboard/sales';
import AppLayout from '@/layouts/app-layout';

export default function SalesPage() {
    return (
        <AppLayout
            breadcrumbs={[{ title: 'Vendas', href: '/dashboard/sales' }]}
        >
            <PageContent>
                <SalesModule />
            </PageContent>
        </AppLayout>
    );
}
