import { PageContent } from '@/components/features/dashboard/page-content';
import { ReportPage } from '@/components/table/report-page';
import AppLayout from '@/layouts/app-layout';

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
