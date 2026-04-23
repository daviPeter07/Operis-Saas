import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { TeamModule } from '@/components/features/dashboard/team';

export default function TeamPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Equipe', href: '/dashboard/team' }]}>
            <PageContent>
                <TeamModule />
            </PageContent>
        </AppLayout>
    );
}