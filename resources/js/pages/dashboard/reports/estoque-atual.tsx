import { ReportPage } from '@/components/table/report-page';
import { PageContent } from '@/features/dashboard/page-content';
import AppLayout from '@/layouts/app-layout';

export default function EstoqueAtualPage() {
    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Estoque Atual',
                    href: '/dashboard/reports/estoque-atual',
                },
            ]}
        >
            <PageContent>
                <ReportPage slug="estoque-atual" />
            </PageContent>
        </AppLayout>
    );
}
