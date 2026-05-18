import { ReportPage } from '@/components/table/report-page';
import { PageContent } from '@/features/dashboard/page-content';
import AppLayout from '@/layouts/app-layout';

export default function CompradorEspecificoPage() {
    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Comprador Específico',
                    href: '/dashboard/reports/comprador-especifico',
                },
            ]}
        >
            <PageContent>
                <ReportPage slug="comprador-especifico" />
            </PageContent>
        </AppLayout>
    );
}
