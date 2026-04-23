import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { AccountsReceivableModule } from '@/components/features/dashboard/accounts-receivable';

export default function AccountsReceivablePage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Accounts Receivable', href: '/dashboard/accounts-receivable' }]}>
            <PageContent>
                <AccountsReceivableModule />
            </PageContent>
        </AppLayout>
    );
}