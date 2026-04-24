import { PageContent } from '@/components/features/dashboard/page-content';
import { ReportPage } from '@/components/table/report-page';
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
