import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { PageHeader } from '@/components/features/dashboard/page-header';
import { EmptyState } from '@/components/features/dashboard/empty-state';
import { Receipt } from 'lucide-react';

export default function AccountsPayablePage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Accounts Payable', href: '/dashboard/accounts-payable' }]}>
            <PageContent>
                <PageHeader
                    title="Accounts Payable"
                    description="Track and manage supplier invoices and payments."
                    action={{
                        label: 'Create Bill',
                        onClick: () => console.log('Create bill'),
                    }}
                />
                <EmptyState
                    icon={Receipt}
                    title="No payables yet"
                    description="Start by creating a bill to track payments."
                    action={{
                        label: 'Create Bill',
                        onClick: () => console.log('Create bill'),
                    }}
                />
            </PageContent>
        </AppLayout>
    );
}