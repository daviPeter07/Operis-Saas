import * as React from 'react';
import { PageContent } from '@/components/page-content';
import { ClientsModule } from '@/features/dashboard/clients';
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
