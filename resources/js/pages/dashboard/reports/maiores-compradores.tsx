import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { ReportPage } from '@/components/table/report-page';

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
