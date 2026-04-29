import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ChartsPanel } from '@/features/dashboard/overview/charts-panel';
import { MetricsGrid } from '@/features/dashboard/overview/metrics-grid';
import { PeriodFilter } from '@/features/dashboard/overview/period-filter';
import type {
    Period,
    CustomRange,
} from '@/features/dashboard/overview/period-filter';
import { RecentActivity } from '@/features/dashboard/overview/recent-activity';
import { ViewSwitcher } from '@/features/dashboard/overview/view-switcher';
import { PageContent } from '@/features/dashboard/page-content';
import { PageHeader } from '@/features/dashboard/page-header';
import AppLayout from '@/layouts/app-layout';
import {
    alerts,
    getOverviewCharts,
    metrics,
    recentActivity,
} from '@/lib/mocks/dashboard-mocks';

export default function DashboardPage() {
    const { auth } = usePage().props as {
        auth: {
            user?: {
                name?: string;
            };
        };
    };
    const [view, setView] = useState<'kpi' | 'chart'>('kpi');
    const [period, setPeriod] = useState<Period>('30d');
    const [customRange, setCustomRange] = useState<CustomRange>({
        from: '2026-04-01',
        to: '2026-04-23',
    });
    const userName = auth.user?.name ?? 'usuário';
    const charts = getOverviewCharts(period, customRange);

    return (
        <AppLayout breadcrumbs={[{ title: 'Visão Geral', href: '/dashboard' }]}>
            <PageContent>
                <PageHeader
                    title={`Bem-vindo, ${userName}`}
                    description="Aqui está uma visão geral do seu negócio."
                >
                    <div className="flex flex-col gap-3 pt-4 md:flex-row md:items-center md:justify-between">
                        <ViewSwitcher view={view} onViewChange={setView} />
                        <div className="md:ml-auto">
                            <PeriodFilter
                                period={period}
                                customRange={customRange}
                                onPeriodChange={(
                                    nextPeriod,
                                    nextCustomRange,
                                ) => {
                                    setPeriod(nextPeriod);

                                    if (
                                        nextPeriod === 'custom' &&
                                        nextCustomRange
                                    ) {
                                        setCustomRange(nextCustomRange);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </PageHeader>

                {view === 'kpi' ? (
                    <div className="grid gap-6">
                        <MetricsGrid metrics={metrics} />
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <RecentActivity activities={recentActivity} />
                            </div>
                            <div className="rounded-xl border bg-card p-4">
                                <h3 className="mb-4 font-semibold">
                                    Alertas e lembretes
                                </h3>
                                <div className="space-y-4">
                                    {alerts.map((alert) => {
                                        return (
                                            <div
                                                key={alert.id}
                                                className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/40 px-4 py-3"
                                            >
                                                <span className="text-sm font-medium text-foreground">
                                                    {alert.label}
                                                </span>
                                                <span
                                                    className={`inline-flex min-w-10 items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${
                                                        alert.value > 0
                                                            ? 'bg-orange-500 text-white'
                                                            : 'bg-muted text-foreground'
                                                    }`}
                                                >
                                                    {alert.value}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <ChartsPanel charts={charts} />
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <RecentActivity activities={recentActivity} />
                            </div>
                            <div className="rounded-xl border bg-card p-4">
                                <h3 className="mb-4 font-semibold">
                                    Alertas e lembretes
                                </h3>
                                <div className="space-y-4">
                                    {alerts.map((alert) => {
                                        return (
                                            <div
                                                key={alert.id}
                                                className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/40 px-4 py-3"
                                            >
                                                <span className="text-sm font-medium text-foreground">
                                                    {alert.label}
                                                </span>
                                                <span
                                                    className={`inline-flex min-w-10 items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${
                                                        alert.value > 0
                                                            ? 'bg-orange-500 text-white'
                                                            : 'bg-muted text-foreground'
                                                    }`}
                                                >
                                                    {alert.value}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </PageContent>
        </AppLayout>
    );
}
