import { usePage } from '@inertiajs/react';
import { PageContent } from '@/components/page-content';
import AppLayout from '@/layouts/app-layout';
import { AdminRequestPage } from '@/pages/dashboard/team/components/admin-request-page';
import { TeamModule } from '@/pages/dashboard/team/components/team-module';

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
