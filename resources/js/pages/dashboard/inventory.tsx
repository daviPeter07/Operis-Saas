import { InventoryModule } from '@/features/dashboard/inventory';
import { PageContent } from '@/features/dashboard/page-content';
import AppLayout from '@/layouts/app-layout';

export default function InventoryPage() {
    return (
        <AppLayout
            breadcrumbs={[{ title: 'Estoque', href: '/dashboard/inventory' }]}
        >
            <PageContent>
                <InventoryModule />
            </PageContent>
        </AppLayout>
    );
}
