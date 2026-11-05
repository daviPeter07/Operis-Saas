import { Bell, Menu, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    demoActivities,
    demoCompanyName,
    demoMetrics,
    demoNavigation,
    demoProfitSeries,
    demoSalesSeries,
} from './demo-data';
import type { DemoActivity, DemoMetric } from './demo-data';
import { DgLogoMark } from './dg-logo';

/** Screen sizes at which the mocks are drawn before being scaled into the frames. */
export const desktopScreenSize = {
    width: 1280,
    height: Math.round((1280 * 700) / 1200),
};
export const mobileScreenSize = {
    width: 390,
    height: Math.round((390 * 843.5) / 389.5),
};

function MetricCard({
    metric,
    compact = false,
}: {
    metric: DemoMetric;
    compact?: boolean;
}) {
    const Icon = metric.icon;

    return (
        <div
            className={cn(
                'flex flex-col justify-between rounded-xl border border-neutral-200/70 bg-white',
                compact ? 'min-h-20 px-3 py-2.5' : 'min-h-24 px-5 pt-2.5 pb-3',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <span
                    className={cn(
                        'font-medium text-neutral-500',
                        compact ? 'text-xs' : 'text-sm',
                    )}
                >
                    {metric.label}
                </span>
                <span
                    className={cn(
                        'flex items-center justify-center ring-1',
                        compact ? 'size-6 rounded-lg' : 'size-8 rounded-xl',
                        metric.iconClassName,
                    )}
                >
                    <Icon className={compact ? 'size-3' : 'size-4'} />
                </span>
            </div>
            <span
                className={cn(
                    'leading-none font-bold',
                    compact ? 'text-base' : 'text-xl',
                )}
            >
                {metric.value}
            </span>
        </div>
    );
}

function LineChartCard({
    title,
    series,
    color,
    height,
}: {
    title: string;
    series: number[];
    color: string;
    height: number;
}) {
    const width = 100;
    const highest = Math.max(...series) * 1.15;
    const points = series.map((value, index) => ({
        x: (index / (series.length - 1)) * width,
        y: height - (value / highest) * height,
    }));
    const line = points.map((point) => `${point.x},${point.y}`).join(' ');
    const area = `0,${height} ${line} ${width},${height}`;

    return (
        <div className="rounded-xl border border-neutral-200/70 bg-white p-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{title}</p>
                <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: color }}
                    />
                    Este mês
                </span>
            </div>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                className="mt-4 w-full"
                style={{ height }}
            >
                {[0.25, 0.5, 0.75].map((ratio) => (
                    <line
                        key={ratio}
                        x1="0"
                        x2={width}
                        y1={height * ratio}
                        y2={height * ratio}
                        stroke="#e5e5e5"
                        strokeDasharray="2 2"
                        vectorEffect="non-scaling-stroke"
                    />
                ))}
                <polygon points={area} fill={color} fillOpacity="0.12" />
                <polyline
                    points={line}
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
        </div>
    );
}

function ActivityRow({
    activity,
    compact = false,
}: {
    activity: DemoActivity;
    compact?: boolean;
}) {
    const Icon = activity.icon;

    return (
        <li className="flex items-center gap-3 py-2.5">
            <span
                className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full',
                    activity.iconClassName,
                )}
            >
                <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                    {activity.description}
                </p>
                <p className="text-xs text-neutral-500">
                    {compact
                        ? activity.time
                        : `${activity.responsible}, ${activity.time}`}
                </p>
            </div>
            {activity.amount && (
                <span className="text-sm font-semibold tabular-nums">
                    {activity.amount}
                </span>
            )}
        </li>
    );
}

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
