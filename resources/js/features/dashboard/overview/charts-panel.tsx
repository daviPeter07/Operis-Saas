import { CalendarDays } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ChartPoint {
    key: string;
    label: string;
    value: number;
}

export interface OverviewChart {
    id: 'vendas' | 'lucro';
    title: string;
    summary: string;
    color: string;
    series: ChartPoint[];
}

interface ChartsPanelProps {
    charts: OverviewChart[];
    /** Period chosen in the date filter, e.g. "Mês atual: 01/11/2026 a 05/11/2026". */
    periodLabel: string;
}

/** Sales on top and profit below, on every screen size. */
export function ChartsPanel({ charts, periodLabel }: ChartsPanelProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {charts.map((chart) => (
                <LineChartCard
                    key={chart.id}
                    chart={chart}
                    periodLabel={periodLabel}
                />
            ))}
        </div>
    );
}

const chartHeight = 240;
const paddingX = 12;
const paddingTop = 14;
const paddingBottom = 10;

/** Width of the drawing area, so the chart always fits without horizontal scroll. */
function useContainerWidth() {
    const ref = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        const observer = new ResizeObserver(([entry]) =>
            setWidth(Math.round(entry.contentRect.width)),
        );
        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return { ref, width };
}

function LineChartCard({
    chart,
    periodLabel,
}: {
    chart: OverviewChart;
    periodLabel: string;
}) {
    const { ref, width } = useContainerWidth();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const values = chart.series.map((point) => point.value);
    const maxValue = Math.max(0, ...values);
    const minValue = Math.min(0, ...values);
    const range = Math.max(maxValue - minValue, 1);
    const drawableWidth = Math.max(width - paddingX * 2, 1);
    const drawableHeight = chartHeight - paddingTop - paddingBottom;
    const step = drawableWidth / Math.max(chart.series.length - 1, 1);

    const points = chart.series.map((point, index) => ({
        ...point,
        x:
            paddingX +
            (chart.series.length === 1 ? drawableWidth / 2 : index * step),
        y:
            paddingTop +
            drawableHeight -
            ((point.value - minValue) / range) * drawableHeight,
    }));

    const linePath = points
        .map(
            (point, index) =>
                `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`,
        )
        .join(' ');
    const areaPath =
        points.length > 1
            ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + drawableHeight} L ${points[0].x} ${paddingTop + drawableHeight} Z`
            : '';
    const gridLines = [0, 0.25, 0.5, 0.75, 1];
    const hovered = hoveredIndex !== null ? points[hoveredIndex] : null;
    const hasData = values.some((value) => value !== 0);

    // Show at most ~6 x-axis labels on phones and ~10 on larger screens.
    const maxLabels = width < 480 ? 5 : 10;
    const labelEvery = Math.max(1, Math.ceil(points.length / maxLabels));

    return (
        <div className="rounded-2xl border bg-card p-4 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground sm:text-base">
                        {chart.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                        <CalendarDays
                            aria-hidden
                            className="size-3.5 shrink-0"
                        />
                        {periodLabel}
                    </p>
                </div>
                <p className="shrink-0 text-lg font-bold text-foreground sm:text-2xl">
                    {chart.summary}
                </p>
            </div>

            <div className="flex gap-2 sm:gap-3">
                <div
                    aria-hidden
                    className="flex w-12 shrink-0 flex-col justify-between py-1 text-right text-[10px] text-muted-foreground sm:w-16 sm:text-[11px]"
                    style={{ height: chartHeight }}
                >
                    {gridLines.map((ratio) => (
                        <span key={ratio}>
                            {hasData
                                ? formatAxisValue(maxValue - range * ratio)
                                : ''}
                        </span>
                    ))}
                </div>

                <div ref={ref} className="relative min-w-0 flex-1">
                    {width > 0 && (
                        <svg
                            width={width}
                            height={chartHeight}
                            role="img"
                            aria-label={`${chart.title}: ${chart.summary}`}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {gridLines.map((ratio) => (
                                <line
                                    key={ratio}
                                    x1={paddingX}
                                    x2={width - paddingX}
                                    y1={paddingTop + drawableHeight * ratio}
                                    y2={paddingTop + drawableHeight * ratio}
                                    stroke="currentColor"
                                    strokeDasharray="4 6"
                                    className="text-border"
                                />
                            ))}

                            {hasData && areaPath && (
                                <path
                                    d={areaPath}
                                    fill={chart.color}
                                    fillOpacity={0.1}
                                />
                            )}
                            {hasData && (
                                <path
                                    d={linePath}
                                    fill="none"
                                    stroke={chart.color}
                                    strokeWidth={2.5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}

                            {hovered && (
                                <line
                                    x1={hovered.x}
                                    x2={hovered.x}
                                    y1={paddingTop}
                                    y2={paddingTop + drawableHeight}
                                    stroke="currentColor"
                                    className="text-muted-foreground/40"
                                />
                            )}
                            {hasData &&
                                points.map((point, index) => (
                                    <circle
                                        key={point.key}
                                        cx={point.x}
                                        cy={point.y}
                                        r={hoveredIndex === index ? 5 : 3}
                                        fill={chart.color}
                                        opacity={
                                            hoveredIndex === index ||
                                            points.length <= 31
                                                ? 1
                                                : 0
                                        }
                                    />
                                ))}

                            {/* Invisible columns that pick the nearest point (mouse and touch). */}
                            {hasData &&
                                points.map((point, index) => (
                                    <rect
                                        key={`hit-${point.key}`}
                                        x={point.x - step / 2}
                                        y={0}
                                        width={Math.max(step, 8)}
                                        height={chartHeight}
                                        fill="transparent"
                                        onMouseEnter={() =>
                                            setHoveredIndex(index)
                                        }
                                        onTouchStart={() =>
                                            setHoveredIndex(index)
                                        }
                                    />
                                ))}
                        </svg>
                    )}

                    {!hasData && width > 0 && (
                        <p
                            className="absolute inset-x-0 top-0 flex items-center justify-center text-center text-sm text-muted-foreground"
                            style={{ height: chartHeight }}
                        >
                            <span className="bg-card px-3">
                                Nenhuma venda no período selecionado.
                            </span>
                        </p>
                    )}

                    {hovered && (
                        <div
                            className="pointer-events-none absolute rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg"
                            style={{
                                left: Math.min(
                                    Math.max(hovered.x, 56),
                                    width - 56,
                                ),
                                top: Math.max(hovered.y - 12, 0),
                                transform: 'translate(-50%, -100%)',
                            }}
                        >
                            <p className="font-semibold text-foreground">
                                {hovered.label}
                            </p>
                            <p className="mt-0.5 text-muted-foreground">
                                {formatCurrency(hovered.value)}
                            </p>
                        </div>
                    )}

                    <div className="relative mt-2 h-4" aria-hidden>
                        {points.map((point, index) =>
                            index % labelEvery === 0 ||
                            index === points.length - 1 ? (
                                <span
                                    key={point.key}
                                    className="absolute -translate-x-1/2 text-[10px] whitespace-nowrap text-muted-foreground sm:text-xs"
                                    style={{
                                        left: Math.min(
                                            Math.max(point.x, 16),
                                            width - 16,
                                        ),
                                    }}
                                >
                                    {point.label}
                                </span>
                            ) : null,
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function formatAxisValue(value: number): string {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact',
        maximumFractionDigits: 1,
    });
}
