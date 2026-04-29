import { PageContent } from '@/features/dashboard/page-content';
import { PurchasesModule } from '@/features/dashboard/purchases';
import AppLayout from '@/layouts/app-layout';

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
