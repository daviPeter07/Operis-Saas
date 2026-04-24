import { PageContent } from '@/components/features/dashboard/page-content';
import { ReportPage } from '@/components/table/report-page';
import AppLayout from '@/layouts/app-layout';

export default function ProdutosMaisVendidosPage() {
    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Produtos Mais Vendidos',
                    href: '/dashboard/reports/produtos-mais-vendidos',
                },
            ]}
        >
            <PageContent>
                <ReportPage slug="produtos-mais-vendidos" />
            </PageContent>
        </AppLayout>
    );
}
