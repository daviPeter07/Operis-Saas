import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { ReportPage } from '@/components/table/report-page';

export default function VendasPage() {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Vendas', href: '/dashboard/reports/vendas' },
            ]}
        >
            <PageContent>
                <ReportPage slug="vendas" />
            </PageContent>
        </AppLayout>
    );
}
