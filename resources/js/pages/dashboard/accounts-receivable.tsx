import { PageContent } from '@/components/page-content';
import { AccountsReceivableModule } from '@/features/dashboard/accounts-receivable';
import AppLayout from '@/layouts/app-layout';

export default function AccountsReceivablePage() {
    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Contas a Receber',
                    href: '/dashboard/accounts-receivable',
                },
            ]}
        >
            <PageContent>
                <AccountsReceivableModule />
            </PageContent>
        </AppLayout>
    );
}
