import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { SalesModule } from '@/components/features/dashboard/sales';

export default function SalesPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Sales', href: '/dashboard/sales' }]}>
            <PageContent>
                <SalesModule />
            </PageContent>
        </AppLayout>
    );
}