import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { ClientsModule } from '@/components/features/dashboard/clients';

export default function ClientsPage() {
    return (
        <AppLayout
            breadcrumbs={[{ title: 'Clientes', href: '/dashboard/clients' }]}
        >
            <PageContent>
                <ClientsModule />
            </PageContent>
        </AppLayout>
    );
}
