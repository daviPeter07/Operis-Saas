import { PageContent } from '@/components/page-content';
import AppLayout from '@/layouts/app-layout';
import { ReportsModule } from '@/pages/dashboard/reports/components/reports-module';

export default function ReportsPage() {
    return (
        <AppLayout
            breadcrumbs={[{ title: 'Relatórios', href: '/dashboard/reports' }]}
        >
            <PageContent>
                <ReportsModule />
            </PageContent>
        </AppLayout>
    );
}
