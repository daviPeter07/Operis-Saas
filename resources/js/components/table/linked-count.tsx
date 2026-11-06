import { RecordLink } from '@/components/table/record-link';

type LinkedCountProps = {
    count: number;
    href: string;
    singular: string;
    plural: string;
    title?: string;
};

export function LinkedCount({
    count,
    href,
    singular,
    plural,
    title = `Ver ${plural} no estoque`,
}: LinkedCountProps) {
    const label = `${count} ${count === 1 ? singular : plural}`;

    if (count === 0) {
        return <span className="text-muted-foreground">{label}</span>;
    }

    return (
        <RecordLink href={href} title={title}>
            {label}
        </RecordLink>
    );
}
