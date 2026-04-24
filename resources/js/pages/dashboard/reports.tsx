import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { ReportsModule } from '@/components/features/dashboard/reports';

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
