import * as React from 'react';
import { router } from '@inertiajs/react';
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
import { exportToExcel } from '@/lib/export-excel';
import { exportToPDF } from '@/lib/export-pdf';
import { cn } from '@/lib/utils';

export interface Column<T> {
    key: string;
    header: string;
    render?: (value: unknown, row: T) => React.ReactNode;
}

export interface GenericTableProps<T extends { id: string }> {
    data: T[];
    columns: Column<T>[];
    title: string;
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
    onCreate?: (data: Partial<T>) => void;
    onImport?: (data: T[]) => void;
    className?: string;
    routeUrl?: string;
}

function parseQueryParams(search: string) {
    const params = new URLSearchParams(search);
    return {
        page: parseInt(params.get('page') || '1'),
        perPage: parseInt(params.get('per_page') || '25'),
        search: params.get('search') || '',
        filters: Object.fromEntries(
            Array.from(params.entries()).filter(
                ([key]) => !['page', 'per_page', 'search'].includes(key),
            ),
        ),
    };
}

function buildQueryString(params: {
    page?: number;
    perPage?: number;
    search?: string;
    filters?: Record<string, string>;
}) {
    const paramsObj = new URLSearchParams();
    if (params.page && params.page > 1)
        paramsObj.set('page', String(params.page));
    if (params.perPage && params.perPage !== 25)
        paramsObj.set('per_page', String(params.perPage));
    if (params.search) paramsObj.set('search', params.search);
    Object.entries(params.filters || {}).forEach(([key, value]) => {
        if (value) paramsObj.set(key, value);
    });
    return paramsObj.toString();
}

export function GenericTable<T extends { id: string }>({
    data,
    columns,
    title,
    searchPlaceholder = 'Buscar...',
    filterFields = [],
    onView,
    onEdit,
    onDelete,
    onCreate,
    onImport,
    className,
    routeUrl,
}: GenericTableProps<T>) {
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(25);
    const [filters, setFilters] = React.useState<Record<string, string>>({});

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = parseQueryParams(window.location.search);
            setSearch(params.search);
            setCurrentPage(params.page);
            setPerPage(params.perPage);
            setFilters(params.filters);
        }
    }, []);

    const updateUrl = React.useCallback(
        (opts: {
            page?: number;
            perPage?: number;
            search?: string;
            filters?: Record<string, string>;
        }) => {
            const newPage = opts.page ?? currentPage;
            const newPerPage = opts.perPage ?? perPage;
            const newSearch = opts.search ?? search;
            const newFilters = opts.filters ?? filters;

            const queryString = buildQueryString({
                page: newPage,
                perPage: newPerPage,
                search: newSearch,
                filters: newFilters,
            });

            const url = routeUrl
                ? `${routeUrl}${queryString ? `?${queryString}` : ''}`
                : queryString
                  ? `?${queryString}`
                  : '/dashboard';

            router.get(url, {}, { replace: true, preserveState: true });
        },
        [currentPage, perPage, search, filters, routeUrl],
    );

    const handleSearchChange = (value: string) => {
        setSearch(value);
        updateUrl({ search: value, page: 1 });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        updateUrl({ page });
    };

    const handleFilterChange = (newFilters: Record<string, string>) => {
        setFilters(newFilters);
        updateUrl({ filters: newFilters, page: 1 });
    };

    const handleClearFilters = () => {
        setFilters({});
        updateUrl({ filters: {}, page: 1 });
    };

    const filteredData = React.useMemo(() => {
        let result = data;

        if (search) {
            const normalizedSearch = search.toLowerCase().trim();
            result = result.filter((item) =>
                Object.values(item).some((val) =>
                    String(val).toLowerCase().includes(normalizedSearch),
                ),
            );
        }

        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== '') {
                result = result.filter(
                    (item) =>
                        String((item as Record<string, unknown>)[key]) ===
                        value,
                );
            }
        });

        return result;
    }, [data, search, filters]);

    const paginatedData = React.useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredData.slice(start, start + perPage);
    }, [filteredData, currentPage, perPage]);

    const totalPages = Math.ceil(filteredData.length / perPage);

    const handleExportExcel = async () => {
        await exportToExcel(
            filteredData as unknown as Record<string, unknown>[],
            {
                fileName: title,
            },
        );
    };

    const handleExportPDF = async () => {
        const pdfColumns = columns.map((col) => ({
            key: col.key,
            header: col.header,
        }));
        await exportToPDF(
            filteredData as unknown as Record<string, unknown>[],
            pdfColumns as never,
            { fileName: title, title },
        );
    };

    const handleView = (row: T) => {
        if (onView) onView(row);
    };

    const handleEdit = (row: T) => {
        if (onEdit) onEdit(row);
    };

    const handleDelete = (row: T) => {
        if (onDelete) onDelete(row);
    };

    return (
        <div className={cn('space-y-4', className)}>
            <TableToolbar
                searchValue={search}
                onSearchChange={handleSearchChange}
                showCreate={!!onCreate}
                onCreate={() => {}}
                showImport={!!onImport}
                onImport={() => {}}
                onExportExcel={handleExportExcel}
                onExportPDF={handleExportPDF}
                onOpenFilters={() => setIsFilterOpen(true)}
                hasActiveFilters={Object.values(filters).some((v) => v !== '')}
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
                                    onClearSearch={() => handleSearchChange('')}
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
                                                    ? () => handleView(row)
                                                    : undefined
                                            }
                                            onEdit={
                                                onEdit
                                                    ? () => handleEdit(row)
                                                    : undefined
                                            }
                                            onDelete={
                                                onDelete
                                                    ? () => handleDelete(row)
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
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredData.length}
                    itemsPerPage={perPage}
                />
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>

            {filterFields.length > 0 && (
                <FilterSidebar
                    open={isFilterOpen}
                    onOpenChange={setIsFilterOpen}
                    fields={filterFields}
                    activeFilters={Object.entries(filters).map(
                        ([field, value]) => ({
                            id: field,
                            field,
                            operator: 'eq' as const,
                            value,
                        }),
                    )}
                    onAddFilter={(filter) => {
                        setFilters((prev) => ({
                            ...prev,
                            [filter.field]: String(filter.value),
                        }));
                    }}
                    onRemoveFilter={(id) => {
                        setFilters((prev) => {
                            const next = { ...prev };
                            delete next[id];
                            return next;
                        });
                    }}
                    onClearFilters={handleClearFilters}
                />
            )}
        </div>
    );
}
