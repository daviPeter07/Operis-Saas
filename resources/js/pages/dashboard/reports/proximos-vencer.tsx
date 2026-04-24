import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { ReportPage } from '@/components/table/report-page';

export default function ProximosVencerPage() {
    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Próximos de Vencer',
                    href: '/dashboard/reports/proximos-vencer',
                },
            ]}
        >
            <PageContent>
                <ReportPage slug="proximos-vencer" />
            </PageContent>
        </AppLayout>
    );
}
