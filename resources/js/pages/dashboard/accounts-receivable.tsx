import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { PageHeader } from '@/components/features/dashboard/page-header';
import { EmptyState } from '@/components/features/dashboard/empty-state';
import { CreditCard } from 'lucide-react';

export default function AccountsReceivablePage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Accounts Receivable', href: '/dashboard/accounts-receivable' }]}>
            <PageContent>
                <PageHeader
                    title="Accounts Receivable"
                    description="Track and manage customer invoices and payments."
                    action={{
                        label: 'Create Invoice',
                        onClick: () => console.log('Create invoice'),
                    }}
                />
                <EmptyState
                    icon={CreditCard}
                    title="No receivables yet"
                    description="Start by creating an invoice to track payments."
                    action={{
                        label: 'Create Invoice',
                        onClick: () => console.log('Create invoice'),
                    }}
                />
            </PageContent>
        </AppLayout>
    );
}