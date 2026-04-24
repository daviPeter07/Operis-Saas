import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { PurchasesModule } from '@/components/features/dashboard/purchases';

export default function PurchasesPage() {
    return (
        <AppLayout
            breadcrumbs={[{ title: 'Compras', href: '/dashboard/purchases' }]}
        >
            <PageContent>
                <PurchasesModule />
            </PageContent>
        </AppLayout>
    );
}
