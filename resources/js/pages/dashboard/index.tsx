import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { PageHeader } from '@/components/features/dashboard/page-header';

export default function DashboardPage() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Visão Geral', href: '/dashboard' }]}>
            <PageContent>
                <PageHeader
                    title="Visão Geral"
                    description="Bem-vindo de volta! Aqui está uma visão geral do seu negócio."
                />
                <div className="grid gap-6">
                    <div className="text-muted-foreground">
                        Overview content coming soon...
                    </div>
                </div>
            </PageContent>
        </AppLayout>
    );
}