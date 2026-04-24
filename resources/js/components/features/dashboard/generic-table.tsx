import * as React from 'react';
import { TableToolbar } from '@/components/table/table-toolbar';
import {
    DataTable,
    DataTableHeadCell,
    DataTableCell,
} from '@/components/table/data-table';
import { DataTableRowZebra } from '@/components/table/data-table-row';
import { Pagination, PaginationInfo } from '@/components/table/pagination';
import { TableEmptyState } from '@/components/table/empty-state';
import { TableActions } from '@/components/table/table-actions';
import { FilterSidebar } from '@/components/table/filter-sidebar';
import { useTablePagination } from '@/hooks/use-table-pagination';
import { cn } from '@/lib/utils';

export interface Column<T> {
    key: string;
    header: string;
    render?: (value: unknown, row: T) => React.ReactNode;
}

export interface GenericTableProps<T extends { id: string }> {
    data: T[];
    columns: Column<T>[];
    searchPlaceholder?: string;
    filterFields?: {
        key: string;
        label: string;
        type: 'text' | 'number' | 'select' | 'date';
        options?: { value: string; label: string }[];
    }[];
    onView?: (row: T) => void;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    onCreate?: () => void;
    onImport?: () => void;
    className?: string;
}

export function GenericTable<T extends { id: string }>({
    data,
    columns,
    searchPlaceholder = 'Buscar...',
    filterFields = [],
    onView,
    onEdit,
    onDelete,
    onCreate,
    onImport,
    className,
}: GenericTableProps<T>) {
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    const { pagination, goToPage } = useTablePagination({ total: data.length });

    const filteredData = React.useMemo(() => {
        if (!search || search.trim() === '') return data;
        const normalizedSearch = search.toLowerCase().trim();
        return data.filter((item: T) =>
            Object.values(item).some((val) =>
                String(val).toLowerCase().includes(normalizedSearch),
            ),
        );
    }, [data, search]);

    const paginatedData = React.useMemo(() => {
        const start = (pagination.page - 1) * pagination.perPage;
        return filteredData.slice(start, start + pagination.perPage);
    }, [filteredData, pagination.page, pagination.perPage]);

    const totalPages = Math.ceil(filteredData.length / pagination.perPage);

    return (
        <div className={cn('space-y-4', className)}>
            <TableToolbar
                searchValue={search}
                onSearchChange={setSearch}
                showCreate={!!onCreate}
                onCreate={onCreate}
                showImport={!!onImport}
                onImport={onImport}
                onOpenFilters={() => setIsFilterOpen(true)}
            />

            <DataTable
                data={paginatedData}
                emptyMessage="Nenhum registro encontrado"
            >
                <thead>
                    <tr>
                        {columns.map((col: Column<T>) => (
                            <DataTableHeadCell key={col.key}>
                                {col.header}
                            </DataTableHeadCell>
                        ))}
                        {(onView || onEdit || onDelete) && (
                            <DataTableHeadCell>Ações</DataTableHeadCell>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + 1}>
                                <TableEmptyState
                                    searchTerm={search}
                                    onClearSearch={() => setSearch('')}
                                />
                            </td>
                        </tr>
                    ) : (
                        paginatedData.map((row: T, index: number) => (
                            <DataTableRowZebra
                                key={String(
                                    (row as { id: string }).id || index,
                                )}
                                index={index}
                            >
                                {columns.map((col: Column<T>) => (
                                    <DataTableCell key={col.key}>
                                        {col.render
                                            ? col.render(
                                                  (
                                                      row as Record<
                                                          string,
                                                          unknown
                                                      >
                                                  )[col.key],
                                                  row,
                                              )
                                            : String(
                                                  (
                                                      row as Record<
                                                          string,
                                                          unknown
                                                      >
                                                  )[col.key] ?? '',
                                              )}
                                    </DataTableCell>
                                ))}
                                {(onView || onEdit || onDelete) && (
                                    <DataTableCell>
                                        <TableActions
                                            onView={
                                                onView
                                                    ? () => onView(row)
                                                    : undefined
                                            }
                                            onEdit={
                                                onEdit
                                                    ? () => onEdit(row)
                                                    : undefined
                                            }
                                            onDelete={
                                                onDelete
                                                    ? () => onDelete(row)
                                                    : undefined
                                            }
                                        />
                                    </DataTableCell>
                                )}
                            </DataTableRowZebra>
                        ))
                    )}
                </tbody>
            </DataTable>

            <div className="flex items-center justify-between">
                <PaginationInfo
                    currentPage={pagination.page}
                    totalPages={totalPages}
                    totalItems={filteredData.length}
                    itemsPerPage={pagination.perPage}
                />
                <Pagination
                    currentPage={pagination.page}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                />
            </div>

            {filterFields.length > 0 && (
                <FilterSidebar
                    open={isFilterOpen}
                    onOpenChange={setIsFilterOpen}
                    fields={filterFields}
                />
            )}
        </div>
    );
}
