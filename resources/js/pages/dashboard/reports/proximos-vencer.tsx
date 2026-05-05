import { ReportPage } from '@/components/table/report-page';
import { PageContent } from '@/features/dashboard/page-content';
import AppLayout from '@/layouts/app-layout';

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
