import { Bell, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    demoActivities,
    demoCompanyName,
    demoMetrics,
    demoNavigation,
    demoProfitSeries,
    demoSalesSeries,
} from '../../utils/constants';
import { ActivityRow } from '../activity-row';
import { DgLogoMark } from '../dg-logo-mark';
import { LineChartCard } from '../line-chart-card';
import { MetricCard } from '../metric-card';

/** Operis overview screen as seen on a desktop browser. */
export function DesktopDemoScreen() {
    return (
        <div className="flex h-full bg-[oklch(0.965_0_0)] font-sans text-neutral-900">
            <aside className="flex w-[232px] shrink-0 flex-col px-3 py-5">
                <div className="flex items-center gap-2.5 px-2">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-white shadow-sm">
                        <DgLogoMark className="h-6 text-neutral-900" />
                    </span>
                    <span className="leading-tight">
                        <span className="block text-sm font-bold">
                            {demoCompanyName}
                        </span>
                        <span className="block text-xs text-neutral-500">
                            Operis
                        </span>
                    </span>
                </div>
                <nav className="mt-6 flex flex-col gap-1">
                    {demoNavigation.map(({ label, icon: Icon }, index) => (
                        <span
                            key={label}
                            className={cn(
                                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium',
                                index === 0
                                    ? 'bg-[oklch(0.22_0_0)] text-white'
                                    : 'text-neutral-600',
                            )}
                        >
                            <Icon className="size-4" />
                            {label}
                        </span>
                    ))}
                </nav>
            </aside>

            <main className="my-2 mr-2 flex-1 overflow-hidden rounded-2xl bg-[oklch(0.985_0_0)] px-7 py-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold">
                            Bem-vindo, {demoCompanyName}
                        </h3>
                        <p className="text-sm text-neutral-500">
                            Resumo de novembro
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="flex w-60 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-400">
                            <Search className="size-4" />
                            Buscar no sistema
                        </span>
                        <Bell className="size-5 text-neutral-500" />
                        <span className="flex size-9 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                            SE
                        </span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-4 gap-4">
                    {demoMetrics.map((metric) => (
                        <MetricCard key={metric.label} metric={metric} />
                    ))}
                </div>

                <div className="mt-4 grid grid-cols-[1.35fr_1fr] gap-4">
                    <div className="grid gap-4">
                        <LineChartCard
                            title="Vendas no período"
                            series={demoSalesSeries}
                            color="#f97316"
                            height={120}
                        />
                        <LineChartCard
                            title="Lucro no período"
                            series={demoProfitSeries}
                            color="#22c55e"
                            height={120}
                        />
                    </div>

                    <div className="rounded-xl border border-neutral-200/70 bg-white p-4">
                        <p className="text-sm font-semibold">
                            Atividades recentes
                        </p>
                        <ul className="mt-2 divide-y divide-neutral-100">
                            {demoActivities.map((activity) => (
                                <ActivityRow
                                    key={activity.description}
                                    activity={activity}
                                />
                            ))}
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}
