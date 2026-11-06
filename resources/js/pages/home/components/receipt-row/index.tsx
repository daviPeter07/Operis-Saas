export function ReceiptRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div
            className={`flex justify-between gap-4 ${strong ? 'font-bold text-neutral-900' : ''}`}
        >
            <span>{label}</span>
            <span className="tabular-nums">{value}</span>
        </div>
    );
}
