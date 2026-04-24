import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import {
    AdminRequestPage,
    TeamModule,
} from '@/components/features/dashboard/team';

export default function TeamPage() {
    const page = usePage();
    const teamMode =
        typeof page.url === 'string'
            ? new URLSearchParams(page.url.split('?')[1] ?? '').get('mode')
            : null;

    return (
        <AppLayout breadcrumbs={[{ title: 'Equipe', href: '/dashboard/team' }]}>
            <PageContent>
                {teamMode === 'admin-request' ? (
                    <AdminRequestPage />
                ) : (
                    <TeamModule />
                )}
            </PageContent>
        </AppLayout>
    );
}
