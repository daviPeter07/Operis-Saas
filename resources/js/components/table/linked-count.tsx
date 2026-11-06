import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

type LinkedCountProps = {
    count: number;
    href: string;
    singular: string;
    plural: string;
};

export function LinkedCount({
    count,
    href,
    singular,
    plural,
}: LinkedCountProps) {
    const label = `${count} ${count === 1 ? singular : plural}`;

    if (count === 0) {
        return <span className="text-muted-foreground">{label}</span>;
    }

    return (
        <Link
            href={href}
            title={`Ver ${plural} no estoque`}
            className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:text-accent hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
            {label}
            <ArrowUpRight aria-hidden className="size-3.5 opacity-60" />
        </Link>
    );
}
