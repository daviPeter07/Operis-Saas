import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type RecordLinkProps = {
    href: string;
    children: ReactNode;
    title?: string;
    className?: string;
};

// The one look for links to another record (tables and details pages).
export function RecordLink({
    href,
    children,
    title,
    className,
}: RecordLinkProps) {
    return (
        <Link
            href={href}
            title={title}
            className={cn(
                'inline-flex items-center gap-1 font-medium text-accent underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                className,
            )}
        >
            {children}
            <ArrowUpRight aria-hidden className="size-3.5 shrink-0" />
        </Link>
    );
}
