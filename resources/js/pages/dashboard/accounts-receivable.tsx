import { AccountsReceivableModule } from '@/components/features/dashboard/accounts-receivable';
import { PageContent } from '@/components/features/dashboard/page-content';
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
