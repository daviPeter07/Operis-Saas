import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function DetailsBackButton({
    label,
    onClick,
}: {
    label: string;
    onClick: () => void;
}) {
    return (
        <Button
            variant="ghost"
            size="sm"
            className="-ml-2 gap-2 text-muted-foreground"
            onClick={onClick}
        >
            <ArrowLeft className="size-4" />
            {label}
        </Button>
    );
}

export function DetailsHeader({
    title,
    status,
    actions,
}: {
    title: string;
    status?: ReactNode;
    actions?: ReactNode;
}) {
    return (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                <h1 className="text-2xl font-bold tracking-tight break-words">
                    {title}
                </h1>
                {status}
            </div>

            {actions ? (
                <div className="flex shrink-0 gap-2">{actions}</div>
            ) : null}
        </header>
    );
}

export function StatusChip({
    active,
    activeLabel = 'Ativo',
    inactiveLabel = 'Inativo',
}: {
    active: boolean;
    activeLabel?: string;
    inactiveLabel?: string;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
                active
                    ? 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300'
                    : 'bg-muted text-muted-foreground ring-border',
            )}
        >
            {active ? activeLabel : inactiveLabel}
        </span>
    );
}

export function DetailsSection({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <Card className="gap-4 border-border bg-card py-5 shadow-sm">
            <CardHeader className="border-b px-5 pb-4">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-5">
                <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
                    {children}
                </dl>
            </CardContent>
        </Card>
    );
}

export function DetailsField({
    label,
    children,
    wide = false,
}: {
    label: string;
    children: ReactNode;
    wide?: boolean;
}) {
    return (
        <div className={cn('space-y-1', wide && 'sm:col-span-2 lg:col-span-4')}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="font-medium break-words text-foreground">
                {children}
            </dd>
        </div>
    );
}

// Same frame as DetailsSection, for content that is not a field grid (tables, timelines).
export function DetailsCard({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <Card className="gap-4 border-border bg-card py-5 shadow-sm">
            <CardHeader className="border-b px-5 pb-4">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-5">{children}</CardContent>
        </Card>
    );
}
