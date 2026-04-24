import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { InventoryModule } from '@/components/features/dashboard/inventory';

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
