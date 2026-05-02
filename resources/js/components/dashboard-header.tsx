import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type DashboardHeaderAction = {
    label: string;
    onClick: () => void;
};

export interface DashboardHeaderProps {
    title: string;
    description?: string;
    actions?: DashboardHeaderAction[];
    children?: ReactNode;
    className?: string;
}

export function DashboardHeader({
    title,
    description,
    actions = [],
    children,
    className,
}: DashboardHeaderProps) {
    return (
        <header className={cn('mb-6 space-y-4', className)}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {title}
                    </h1>
                    {description ? (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    ) : null}
                </div>

                {actions.length > 0 ? (
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                        {actions.map((action) => (
                            <Button key={action.label} onClick={action.onClick}>
                                {action.label}
                            </Button>
                        ))}
                    </div>
                ) : null}
            </div>

            {children ? <div>{children}</div> : null}
        </header>
    );
}
