import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { PageHeader } from '@/components/features/dashboard/page-header';
import { EmptyState } from '@/components/features/dashboard/empty-state';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Reports', href: '/dashboard/reports' }]}>
            <PageContent>
                <PageHeader
                    title="Reports"
                    description="View and generate business reports."
                    action={{
                        label: 'Create Report',
                        onClick: () => console.log('Create report'),
                    }}
                />
                <EmptyState
                    icon={BarChart3}
                    title="No reports yet"
                    description="Start by creating a report to analyze your business."
                    action={{
                        label: 'Create Report',
                        onClick: () => console.log('Create report'),
                    }}
                />
            </PageContent>
        </AppLayout>
    );
}