import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { ReportPage } from '@/components/table/report-page';

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
