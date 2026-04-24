import { useState } from 'react';

interface ChartPoint {
    date: string;
    label: string;
    value: number;
}

interface OverviewChart {
    id: 'vendas' | 'lucro';
    title: string;
    summary: string;
    description: string;
    color: string;
    series: ChartPoint[];
}

interface ChartsPanelProps {
    charts: OverviewChart[];
}

export function ChartsPanel({ charts }: ChartsPanelProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
            {charts.map((chart) => (
                <LineChartCard key={chart.id} chart={chart} />
            ))}
        </div>
    );
}

function LineChartCard({ chart }: { chart: OverviewChart }) {
    const [hoveredPoint, setHoveredPoint] = useState<{
        x: number;
        y: number;
        label: string;
        value: number;
        bandStart: number;
        bandWidth: number;
    } | null>(null);
    const width = Math.max(720, chart.series.length * 72);
    const height = 240;
    const paddingX = 20;
    const paddingTop = 12;
    const paddingBottom = 24;
    const gridLines = 4;
    const values = chart.series.map((point) => point.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = Math.max(maxValue - minValue, 1);

    const points = chart.series.map((point, index) => {
        const x =
            paddingX +
            (index * (width - paddingX * 2)) /
                Math.max(chart.series.length - 1, 1);
        const normalized = (point.value - minValue) / range;
        const y =
            height -
            paddingBottom -
            normalized * (height - paddingTop - paddingBottom);

        return { ...point, x, y };
    });

    const hoverBands = points.map((point, index) => {
        const previousX = points[index - 1]?.x ?? paddingX;
        const nextX = points[index + 1]?.x ?? width - paddingX;
        const bandStart = index === 0 ? paddingX : (previousX + point.x) / 2;
        const bandEnd =
            index === points.length - 1
                ? width - paddingX
                : (point.x + nextX) / 2;

        return {
            ...point,
            bandStart,
            bandWidth: bandEnd - bandStart,
        };
    });

    const linePath = buildLinePath(points);
    const axisValues = Array.from({ length: gridLines + 1 }).map((_, index) => {
        const ratio = (gridLines - index) / gridLines;

        return Math.round(minValue + range * ratio);
    });

    return (
        <div className="rounded-2xl border bg-card p-3 sm:p-6">
            <div className="mb-4 sm:mb-6 flex items-start justify-between gap-2 sm:gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-foreground sm:text-base">
                        {chart.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
                        {chart.description}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-foreground sm:text-2xl">
                        {chart.summary}
                    </p>
                </div>
            </div>

            <div className="relative pl-10 sm:pl-14">
                <div className="pointer-events-none absolute top-2 left-0 flex h-[200px] sm:h-[320px] w-9 sm:w-11 flex-col justify-between text-left text-[10px] sm:text-[11px] text-muted-foreground">
                    {axisValues.map((value, index) => (
                        <span key={index}>{formatAxisValue(value)}</span>
                    ))}
                </div>

                <div className="min-w-0 overflow-x-auto">
                    <div style={{ minWidth: `${width}px` }}>
                        <div className="relative">
                            <svg
                                viewBox={`0 0 ${width} ${height}`}
                                className="h-[200px] w-full sm:h-[320px]"
                                aria-hidden="true"
                            >
                                {Array.from({ length: gridLines + 1 }).map(
                                    (_, index) => {
                                        const y =
                                            paddingTop +
                                            (index *
                                                (height -
                                                    paddingTop -
                                                    paddingBottom)) /
                                                gridLines;

                                        return (
                                            <line
                                                key={index}
                                                x1={paddingX}
                                                y1={y}
                                                x2={width - paddingX}
                                                y2={y}
                                                stroke="currentColor"
                                                strokeDasharray="4 6"
                                                className="text-border/70"
                                            />
                                        );
                                    },
                                )}

                                {hoveredPoint ? (
                                    <rect
                                        x={hoveredPoint.bandStart}
                                        y={paddingTop}
                                        width={hoveredPoint.bandWidth}
                                        height={
                                            height - paddingTop - paddingBottom
                                        }
                                        rx="14"
                                        fill="currentColor"
                                        className="text-orange-500/10"
                                    />
                                ) : null}

                                <path
                                    d={linePath}
                                    fill="none"
                                    stroke={chart.color}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {hoverBands.map((point) => (
                                    <g key={point.date}>
                                        <rect
                                            x={point.bandStart}
                                            y={paddingTop}
                                            width={point.bandWidth}
                                            height={
                                                height -
                                                paddingTop -
                                                paddingBottom
                                            }
                                            fill="transparent"
                                            onMouseEnter={() =>
                                                setHoveredPoint({
                                                    x: point.x,
                                                    y: point.y,
                                                    label: point.label,
                                                    value: point.value,
                                                    bandStart: point.bandStart,
                                                    bandWidth: point.bandWidth,
                                                })
                                            }
                                            onMouseLeave={() =>
                                                setHoveredPoint(null)
                                            }
                                        />
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r={
                                                hoveredPoint?.label ===
                                                point.label
                                                    ? '5'
                                                    : '3.5'
                                            }
                                            fill="transparent"
                                        />
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r={
                                                hoveredPoint?.label ===
                                                point.label
                                                    ? '5'
                                                    : '3.5'
                                            }
                                            fill={chart.color}
                                            onMouseEnter={() =>
                                                setHoveredPoint({
                                                    x: point.x,
                                                    y: point.y,
                                                    label: point.label,
                                                    value: point.value,
                                                    bandStart: point.bandStart,
                                                    bandWidth: point.bandWidth,
                                                })
                                            }
                                            onMouseLeave={() =>
                                                setHoveredPoint(null)
                                            }
                                        />
                                    </g>
                                ))}
                            </svg>

                            {hoveredPoint ? (
                                <div
                                    className="pointer-events-none absolute rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg"
                                    style={getTooltipStyle(
                                        hoveredPoint,
                                        width,
                                        height,
                                    )}
                                >
                                    <p className="font-semibold text-foreground">
                                        {hoveredPoint.label}
                                    </p>
                                    <p className="mt-1 text-muted-foreground">
                                        {formatCurrency(hoveredPoint.value)}
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        <div
                            className="mt-3 flex"
                            style={{ width: `${width}px` }}
                        >
                            {chart.series.map((point) => (
                                <span
                                    key={point.date}
                                    className="text-center text-xs whitespace-nowrap text-muted-foreground"
                                    style={{
                                        width: `${width / chart.series.length}px`,
                                    }}
                                >
                                    {point.label}
                                </span>
                            ))}
                        </div>
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
        maximumFractionDigits: 0,
    });
}

function formatAxisValue(value: number): string {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
    });
}

function getTooltipStyle(
    hoveredPoint: {
        x: number;
        y: number;
        bandStart: number;
        bandWidth: number;
    },
    width: number,
    height: number,
): React.CSSProperties {
    const centerX =
        ((hoveredPoint.bandStart + hoveredPoint.bandWidth / 2) / width) * 100;
    const placeBelow = hoveredPoint.y < 72;

    return {
        left: `${centerX}%`,
        top: `${(hoveredPoint.y / height) * 100}%`,
        transform: placeBelow
            ? 'translate(-50%, 14px)'
            : 'translate(-50%, -115%)',
    };
}

function buildLinePath(points: Array<{ x: number; y: number }>): string {
    if (points.length === 0) {
        return '';
    }

    return points.reduce((path, point, index) => {
        return `${path}${index === 0 ? 'M' : ' L'} ${point.x} ${point.y}`;
    }, '');
}
