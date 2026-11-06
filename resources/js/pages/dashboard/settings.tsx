import { PageContent } from '@/components/page-content';
import AppLayout from '@/layouts/app-layout';
import { SettingsModule } from '@/pages/dashboard/settings/components/settings-module';

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
