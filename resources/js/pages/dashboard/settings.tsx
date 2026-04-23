import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { PageHeader } from '@/components/features/dashboard/page-header';
import { EmptyState } from '@/components/features/dashboard/empty-state';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Settings', href: '/dashboard/settings' }]}>
            <PageContent>
                <PageHeader
                    title="Settings"
                    description="Configure your workspace and preferences."
                />
                <EmptyState
                    icon={Settings}
                    title="No settings configured"
                    description="Configure your workspace settings to get started."
                    action={{
                        label: 'Configure',
                        onClick: () => console.log('Settings'),
                    }}
                />
            </PageContent>
        </AppLayout>
    );
}