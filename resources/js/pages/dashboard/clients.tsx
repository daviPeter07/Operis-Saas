import * as React from 'react';
import { ClientsModule } from '@/features/dashboard/clients';
import { PageContent } from '@/features/dashboard/page-content';
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
