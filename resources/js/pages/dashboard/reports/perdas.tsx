import { ReportPage } from '@/components/table/report-page';
import { PageContent } from '@/features/dashboard/page-content';
import AppLayout from '@/layouts/app-layout';

export default function PerdasPage() {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Perdas', href: '/dashboard/reports/perdas' },
            ]}
        >
            <PageContent>
                <ReportPage slug="perdas" />
            </PageContent>
        </AppLayout>
    );
}
