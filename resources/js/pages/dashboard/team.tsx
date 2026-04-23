import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { PageHeader } from '@/components/features/dashboard/page-header';
import { EmptyState } from '@/components/features/dashboard/empty-state';
import { UsersRound } from 'lucide-react';

export default function TeamPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Team', href: '/dashboard/team' }]}>
            <PageContent>
                <PageHeader
                    title="Team"
                    description="Manage your team members and permissions."
                    action={{
                        label: 'Invite Member',
                        onClick: () => console.log('Invite member'),
                    }}
                />
                <EmptyState
                    icon={UsersRound}
                    title="No team members yet"
                    description="Start by inviting team members to collaborate."
                    action={{
                        label: 'Invite Member',
                        onClick: () => console.log('Invite member'),
                    }}
                />
            </PageContent>
        </AppLayout>
    );
}