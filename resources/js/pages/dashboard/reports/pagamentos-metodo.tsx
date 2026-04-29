import { PageContent } from '@/features/dashboard/page-content';
import { ReportPage } from '@/components/table/report-page';
import AppLayout from '@/layouts/app-layout';

export default function PagamentosMetodoPage() {
    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Pagamentos por Método',
                    href: '/dashboard/reports/pagamentos-metodo',
                },
            ]}
        >
            <PageContent>
                <ReportPage slug="pagamentos-metodo" />
            </PageContent>
        </AppLayout>
    );
}
