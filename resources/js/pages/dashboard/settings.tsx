import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { SettingsModule } from '@/components/features/dashboard/settings';

export default function SettingsPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Configurações', href: '/dashboard/settings' }]}>
            <PageContent>
                <SettingsModule />
            </PageContent>
        </AppLayout>
    );
}