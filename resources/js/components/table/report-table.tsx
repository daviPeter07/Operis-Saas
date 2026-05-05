import * as React from 'react';
import { DataTable } from '@/components/table/data-table';
import {
    DataTableHeadCell,
    DataTableCell,
} from '@/components/table/data-table';
import { DataTableRowZebra } from '@/components/table/data-table-row';
import { TableEmptyState } from '@/components/table/empty-state';
import type { FilterField } from '@/components/table/filter-sidebar';
import { Pagination, PaginationInfo } from '@/components/table/pagination';
import { TableToolbar } from '@/components/table/table-toolbar';
import { useTableSearch, searchData } from '@/hooks/use-table-search';
import { cn } from '@/lib/utils';

export interface ReportColumn<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
}

export interface ReportTableProps<T extends Record<string, unknown>> {
    data: T[];
    columns: ReportColumn<T>[];
    title: string;
    searchPlaceholder?: string;
    filterFields?: FilterField[];
    onSearchChange?: (search: string) => void;
    onExportExcel?: () => void;
    onExportPDF?: () => void;
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    perPage?: number;
    onPageChange?: (page: number) => void;
    emptyMessage?: string;
    className?: string;
}

export function ReportTable<T extends Record<string, unknown>>({
    data,
    columns,
    onSearchChange,
    onExportExcel,
    onExportPDF,
    currentPage = 1,
    totalItems,
    perPage = 25,
    onPageChange,
    emptyMessage = 'Nenhum registro encontrado',
    className,
}: ReportTableProps<T>) {
    const { search, setSearch, debouncedSearch } = useTableSearch({
        onSearchChange,
    });

    const filteredData = React.useMemo(() => {
        return searchData(data, debouncedSearch);
    }, [data, debouncedSearch]);

    const paginatedData = React.useMemo(() => {
        const start = (currentPage - 1) * perPage;

        return filteredData.slice(start, start + perPage);
    }, [filteredData, currentPage, perPage]);

    const displayTotal = totalItems ?? filteredData.length;
    const displayTotalPages = Math.ceil(filteredData.length / perPage);

    return (
        <div className={cn('space-y-4', className)}>
            <TableToolbar
                searchValue={search}
                onSearchChange={setSearch}
                showCreate={false}
                showImport={false}
                onExportExcel={onExportExcel}
                onExportPDF={onExportPDF}
            />

            <DataTable data={paginatedData} emptyMessage={emptyMessage}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <DataTableHeadCell key={String(col.key)}>
                                {col.header}
                            </DataTableHeadCell>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length}>
                                <TableEmptyState
                                    searchTerm={search}
                                    onClearSearch={() => setSearch('')}
                                />
                            </td>
                        </tr>
                    ) : (
                        paginatedData.map((item, index) => (
                            <DataTableRowZebra key={index} index={index}>
                                {columns.map((col) => (
                                    <DataTableCell key={String(col.key)}>
                                        {col.render
                                            ? col.render(item)
                                            : String(
                                                  item[col.key as keyof T] ??
                                                      '',
                                              )}
                                    </DataTableCell>
                                ))}
                            </DataTableRowZebra>
                        ))
                    )}
                </tbody>
            </DataTable>

            <div className="flex items-center justify-between">
                <PaginationInfo
                    currentPage={currentPage}
                    totalPages={displayTotalPages}
                    totalItems={displayTotal}
                    itemsPerPage={perPage}
                />
                <Pagination
                    currentPage={currentPage}
                    totalPages={displayTotalPages}
                    onPageChange={onPageChange || (() => {})}
                />
            </div>
        </div>
    );
}
