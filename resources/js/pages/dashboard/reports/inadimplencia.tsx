import { ReportPage } from '@/components/table/report-page';
import { PageContent } from '@/features/dashboard/page-content';
import AppLayout from '@/layouts/app-layout';

export default function InadimplenciaPage() {
    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Inadimplência',
                    href: '/dashboard/reports/inadimplencia',
                },
            ]}
        >
            <PageContent>
                <ReportPage slug="inadimplencia" />
            </PageContent>
        </AppLayout>
    );
}
