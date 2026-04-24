import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { AccountsPayableModule } from '@/components/features/dashboard/accounts-payable';

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
