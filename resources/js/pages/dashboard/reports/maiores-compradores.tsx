import { ReportPage } from '@/components/table/report-page';
import { PageContent } from '@/features/dashboard/page-content';
import AppLayout from '@/layouts/app-layout';

export default function MaioresCompradoresPage() {
    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Maiores Compradores',
                    href: '/dashboard/reports/maiores-compradores',
                },
            ]}
        >
            <PageContent>
                <ReportPage slug="maiores-compradores" />
            </PageContent>
        </AppLayout>
    );
}
