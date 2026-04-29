import { PageContent } from '@/features/dashboard/page-content';
import { SettingsModule } from '@/features/dashboard/settings';
import AppLayout from '@/layouts/app-layout';

export default function SettingsPage() {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Configurações', href: '/dashboard/settings' },
            ]}
        >
            <PageContent>
                <SettingsModule />
            </PageContent>
        </AppLayout>
    );
}
