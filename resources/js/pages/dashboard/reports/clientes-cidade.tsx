import { PageContent } from '@/features/dashboard/page-content';
import { ReportPage } from '@/components/table/report-page';
import AppLayout from '@/layouts/app-layout';

export default function ClientesCidadePage() {
    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Clientes por Cidade',
                    href: '/dashboard/reports/clientes-cidade',
                },
            ]}
        >
            <PageContent>
                <ReportPage slug="clientes-cidade" />
            </PageContent>
        </AppLayout>
    );
}
