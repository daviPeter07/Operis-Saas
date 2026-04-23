import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { PageContent } from '@/components/features/dashboard/page-content';
import { PageHeader } from '@/components/features/dashboard/page-header';
import { ViewSwitcher } from '@/components/features/dashboard/overview/view-switcher';
import { PeriodFilter, type Period } from '@/components/features/dashboard/overview/period-filter';
import { MetricsGrid } from '@/components/features/dashboard/overview/metrics-grid';
import { ChartsPanel } from '@/components/features/dashboard/overview/charts-panel';
import { RecentActivity } from '@/components/features/dashboard/overview/recent-activity';
import { metrics, recentActivity, revenueChartData, salesChartData } from '@/lib/mocks/dashboard-mocks';

export default function DashboardPage() {
    const [view, setView] = useState<'kpi' | 'chart'>('kpi');
    const [period, setPeriod] = useState<Period>('30d');

    return (
        <AppLayout breadcrumbs={[{ title: 'Visão Geral', href: '/dashboard' }]}>
            <PageContent>
                <PageHeader
                    title="Visão Geral"
                    description="Bem-vindo de volta! Aqui está uma visão geral do seu negócio."
                >
                    <div className="flex gap-3">
                        <PeriodFilter period={period} onPeriodChange={setPeriod} />
                        <ViewSwitcher view={view} onViewChange={setView} />
                    </div>
                </PageHeader>

                {view === 'kpi' ? (
                    <div className="grid gap-6">
                        <MetricsGrid metrics={metrics} />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <RecentActivity activities={recentActivity} />
                            </div>
                            <div className="bg-card rounded-xl border p-6">
                                <h3 className="font-semibold mb-4">Resumo Rápido</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Vendas Hoje</span>
                                        <span className="font-semibold">R$ 3.450</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Pedidos Hoje</span>
                                        <span className="font-semibold">12</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Novos Clientes</span>
                                        <span className="font-semibold">5</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Produtos Ativos</span>
                                        <span className="font-semibold">456</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <ChartsPanel
                            revenueData={revenueChartData}
                            salesData={salesChartData}
                        />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <RecentActivity activities={recentActivity} />
                            </div>
                            <div className="bg-card rounded-xl border p-6">
                                <h3 className="font-semibold mb-4">Tendência</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div className="bg-accent h-2 rounded-full" style={{ width: '75%' }} />
                                        </div>
                                        <span className="text-sm font-medium">75%</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Meta de vendas atingida este mês</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </PageContent>
        </AppLayout>
    );
}