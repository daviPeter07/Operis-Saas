import { Package } from 'lucide-react';
import * as React from 'react';
import { Table } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface DataTableProps<TData> {
    data: TData[];
    children: React.ReactNode;
    className?: string;
    emptyMessage?: string;
}

export function DataTable<TData>({
    data,
    children,
    className,
    emptyMessage = 'Nenhum registro encontrado',
}: DataTableProps<TData>) {
    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="mb-4 h-12 w-12" />
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={cn('rounded-md border', className)}>
            <Table>{children}</Table>
        </div>
    );
}

export interface DataTableHeaderProps {
    columns: React.ReactNode;
}

export function DataTableHeader({ columns }: DataTableHeaderProps) {
    return <>{columns}</>;
}

export interface DataTableRowProps {
    children: React.ReactNode;
    className?: string;
}

export function DataTableRow({ children }: DataTableRowProps) {
    return <>{children}</>;
}

export interface DataTableBodyProps {
    children: React.ReactNode;
}

export function DataTableBody({ children }: DataTableBodyProps) {
    return <tbody className="[&_tr:last-child]:border-0">{children}</tbody>;
}

export interface DataTableHeadCellProps {
    children: React.ReactNode;
    className?: string;
}

export function DataTableHeadCell({
    children,
    className,
}: DataTableHeadCellProps) {
    return (
        <th
            className={cn(
                'p-4 text-left font-medium text-muted-foreground',
                className,
            )}
        >
            {children}
        </th>
    );
}

export interface DataTableCellProps {
    children: React.ReactNode;
    className?: string;
}

export function DataTableCell({ children, className }: DataTableCellProps) {
    return <td className={cn('p-4', className)}>{children}</td>;
}
