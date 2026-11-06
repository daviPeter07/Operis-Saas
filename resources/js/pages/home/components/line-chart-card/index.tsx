export function LineChartCard({
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
