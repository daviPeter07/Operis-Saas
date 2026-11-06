import { Menu, Plus } from 'lucide-react';
import {
    demoActivities,
    demoCompanyName,
    demoMetrics,
    demoSalesSeries,
} from '../../utils/constants';
import { ActivityRow } from '../activity-row';
import { DgLogoMark } from '../dg-logo-mark';
import { LineChartCard } from '../line-chart-card';
import { MetricCard } from '../metric-card';

/** The same overview, as the responsive layout shows it on a phone. */
export function MobileDemoScreen() {
    return (
        <div className="relative flex h-full flex-col bg-[oklch(0.965_0_0)] font-sans text-neutral-900">
            <div className="flex items-center justify-between px-5 pt-16 pb-3">
                <Menu className="size-6" />
                <span className="flex items-center gap-2">
                    <DgLogoMark className="h-6 text-neutral-900" />
                    <span className="text-sm font-bold">{demoCompanyName}</span>
                </span>
                <span className="flex size-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                    SE
                </span>
            </div>

            <div className="flex-1 overflow-hidden rounded-t-[1.75rem] bg-[oklch(0.985_0_0)] px-4 pt-5">
                <h3 className="text-xl font-bold">Visão Geral</h3>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    {demoMetrics.map((metric) => (
                        <MetricCard
                            key={metric.label}
                            metric={metric}
                            compact
                        />
                    ))}
                </div>

                <div className="mt-3">
                    <LineChartCard
                        title="Vendas no período"
                        series={demoSalesSeries}
                        color="#f97316"
                        height={90}
                    />
                </div>

                <div className="mt-3 rounded-xl border border-neutral-200/70 bg-white px-3 pt-3">
                    <p className="text-sm font-semibold">Atividades recentes</p>
                    <ul className="divide-y divide-neutral-100">
                        {demoActivities.slice(0, 3).map((activity) => (
                            <ActivityRow
                                key={activity.description}
                                activity={activity}
                                compact
                            />
                        ))}
                    </ul>
                </div>
            </div>

            <span className="absolute right-5 bottom-8 flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-lg">
                <Plus className="size-4" />
                Nova venda
            </span>
        </div>
    );
}
