import { Bell, Menu, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    demoDailySales,
    demoMetrics,
    demoNavigation,
    demoRecentSales,
} from './demo-data';
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

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                status === 'Concluída'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700',
            )}
        >
            {status}
        </span>
    );
}

function SalesChart({ height }: { height: number }) {
    const highest = Math.max(...demoDailySales);

    return (
        <div className="flex items-end gap-[6px]" style={{ height }}>
            {demoDailySales.map((value, day) => (
                <div
                    key={day}
                    className={cn(
                        'flex-1 rounded-t-md',
                        day === demoDailySales.length - 1
                            ? 'bg-dg-orange'
                            : 'bg-neutral-800/85',
                    )}
                    style={{ height: `${(value / highest) * 100}%` }}
                />
            ))}
        </div>
    );
}

/** Operis overview screen as seen on a desktop browser. */
export function DesktopDemoScreen() {
    return (
        <div className="flex h-full bg-[oklch(0.965_0_0)] font-sans text-neutral-900">
            <aside className="flex w-[232px] shrink-0 flex-col px-3 py-5">
                <div className="flex items-center gap-2 px-3">
                    <DgLogoMark className="h-7 text-neutral-900" />
                    <span className="font-display text-lg font-bold">
                        Operis
                    </span>
                </div>
                <nav className="mt-6 flex flex-col gap-1">
                    {demoNavigation.map(({ label, icon: Icon }, index) => (
                        <span
                            key={label}
                            className={cn(
                                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium',
                                index === 0
                                    ? 'bg-neutral-900 text-white'
                                    : 'text-neutral-600',
                            )}
                        >
                            <Icon className="size-4" />
                            {label}
                        </span>
                    ))}
                </nav>
            </aside>

            <main className="my-2 mr-2 flex-1 overflow-hidden rounded-2xl bg-white px-8 py-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-neutral-500">Boa tarde!</p>
                        <h3 className="text-2xl font-bold">Visão Geral</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="flex w-64 items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-400">
                            <Search className="size-4" />
                            Buscar no sistema
                        </span>
                        <Bell className="size-5 text-neutral-500" />
                        <span className="flex size-9 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                            DG
                        </span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-4 gap-4">
                    {demoMetrics.map((metric) => (
                        <div
                            key={metric.label}
                            className="rounded-2xl border border-neutral-200/80 px-5 py-4"
                        >
                            <p className="text-sm font-medium text-neutral-500">
                                {metric.label}
                            </p>
                            <p className="mt-3 text-[1.35rem] font-bold">
                                {metric.value}
                            </p>
                            <p className="mt-1 text-xs text-neutral-500">
                                {metric.detail}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-5 grid grid-cols-[1.25fr_1fr] gap-4">
                    <div className="rounded-2xl border border-neutral-200/80 p-5">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">Vendas por dia</p>
                            <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                                Novembro
                            </span>
                        </div>
                        <div className="mt-6">
                            <SalesChart height={330} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/80 p-5">
                        <p className="font-semibold">Vendas recentes</p>
                        <ul className="mt-3 divide-y divide-neutral-100">
                            {demoRecentSales.map((sale) => (
                                <li
                                    key={sale.customer}
                                    className="flex items-center justify-between gap-3 py-2.5"
                                >
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {sale.customer}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {sale.method}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-sm font-semibold tabular-nums">
                                            {sale.amount}
                                        </span>
                                        <StatusBadge status={sale.status} />
                                    </div>
                                </li>
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
                    <span className="font-display text-lg font-bold">
                        Operis
                    </span>
                </span>
                <span className="flex size-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                    DG
                </span>
            </div>

            <div className="flex-1 overflow-hidden rounded-t-[1.75rem] bg-white px-5 pt-5">
                <h3 className="text-xl font-bold">Visão Geral</h3>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    {demoMetrics.map((metric) => (
                        <div
                            key={metric.label}
                            className="rounded-2xl border border-neutral-200/80 px-3.5 py-3"
                        >
                            <p className="text-xs font-medium text-neutral-500">
                                {metric.label}
                            </p>
                            <p className="mt-2 text-base font-bold">
                                {metric.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-4 rounded-2xl border border-neutral-200/80 p-4">
                    <p className="text-sm font-semibold">Vendas por dia</p>
                    <div className="mt-4">
                        <SalesChart height={110} />
                    </div>
                </div>

                <p className="mt-5 text-sm font-semibold">Vendas recentes</p>
                <ul className="mt-1 divide-y divide-neutral-100">
                    {demoRecentSales.slice(0, 4).map((sale) => (
                        <li
                            key={sale.customer}
                            className="flex items-center justify-between gap-3 py-2.5"
                        >
                            <div>
                                <p className="text-sm font-semibold">
                                    {sale.customer}
                                </p>
                                <p className="text-xs text-neutral-500">
                                    {sale.method}
                                </p>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">
                                {sale.amount}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <span className="absolute right-5 bottom-8 flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-lg">
                <Plus className="size-4" />
                Nova venda
            </span>
        </div>
    );
}
