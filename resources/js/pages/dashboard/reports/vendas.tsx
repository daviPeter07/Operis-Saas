import { ReportPage } from '@/components/table/report-page';
import { PageContent } from '@/features/dashboard/page-content';
import AppLayout from '@/layouts/app-layout';

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
