import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DataTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    variant?: 'default' | 'even' | 'odd';
}

export function DataTableRow({
    children,
    className,
    variant = 'default',
    ...props
}: DataTableRowProps) {
    const variantClasses = {
        default: '',
        even: 'bg-muted/50',
        odd: 'bg-background',
    };

    return (
        <tr
            className={cn(
                'border-b transition-colors hover:bg-muted/50',
                variantClasses[variant],
                className,
            )}
            {...props}
        >
            {children}
        </tr>
    );
}

export interface DataTableRowWithZebraProps extends React.HTMLAttributes<HTMLTableRowElement> {
    index: number;
}

export function DataTableRowZebra({
    children,
    index,
    className,
    ...props
}: DataTableRowWithZebraProps) {
    const isEven = index % 2 === 0;

    return (
        <DataTableRow
            className={cn(isEven ? 'bg-muted/50' : 'bg-background', className)}
            {...props}
        >
            {children}
        </DataTableRow>
    );
}
