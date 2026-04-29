import { PageContent } from '@/features/dashboard/page-content';
import { ReportsModule } from '@/features/dashboard/reports';
import AppLayout from '@/layouts/app-layout';

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
