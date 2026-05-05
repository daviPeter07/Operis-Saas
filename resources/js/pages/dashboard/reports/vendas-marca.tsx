import { ReportPage } from '@/components/table/report-page';
import { PageContent } from '@/features/dashboard/page-content';
import AppLayout from '@/layouts/app-layout';

export default function VendasMarcaPage() {
    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Vendas por Marca',
                    href: '/dashboard/reports/vendas-marca',
                },
            ]}
        >
            <PageContent>
                <ReportPage slug="vendas-marca" />
            </PageContent>
        </AppLayout>
    );
}
