import { PageContent } from '@/components/features/dashboard/page-content';
import { ReportPage } from '@/components/table/report-page';
import AppLayout from '@/layouts/app-layout';

export default function VendasCategoriaPage() {
    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Vendas por Categoria',
                    href: '/dashboard/reports/vendas-categoria',
                },
            ]}
        >
            <PageContent>
                <ReportPage slug="vendas-categoria" />
            </PageContent>
        </AppLayout>
    );
}
