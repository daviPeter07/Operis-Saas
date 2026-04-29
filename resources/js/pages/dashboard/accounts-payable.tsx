import { AccountsPayableModule } from '@/features/dashboard/accounts-payable';
import { PageContent } from '@/features/dashboard/page-content';
import AppLayout from '@/layouts/app-layout';

export default function AccountsPayablePage() {
    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Contas a Pagar',
                    href: '/dashboard/accounts-payable',
                },
            ]}
        >
            <PageContent>
                <AccountsPayableModule />
            </PageContent>
        </AppLayout>
    );
}
