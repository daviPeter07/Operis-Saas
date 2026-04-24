import { PageContent } from '@/components/features/dashboard/page-content';
import { ReportPage } from '@/components/table/report-page';
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
