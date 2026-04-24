import { ClientsModule } from '@/components/features/dashboard/clients';
import { PageContent } from '@/components/features/dashboard/page-content';
import AppLayout from '@/layouts/app-layout';

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
