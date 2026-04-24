import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { ReportPage } from '@/components/table/report-page';

export default function EstoqueMarcaPage() {
    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Estoque por Marca',
                    href: '/dashboard/reports/estoque-marca',
                },
            ]}
        >
            <PageContent>
                <ReportPage slug="estoque-marca" />
            </PageContent>
        </AppLayout>
    );
}
