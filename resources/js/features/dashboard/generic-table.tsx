import {
    ArrowDown,
    ArrowDownAZ,
    ArrowUp,
    ArrowUpZA,
    ArrowUpDown,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { CreateModal } from '@/components/table/create-modal';
import type { FormField } from '@/components/table/create-modal';
import {
    DataTable,
    DataTableHeadCell,
    DataTableCell,
} from '@/components/table/data-table';
import { DataTableRowZebra } from '@/components/table/data-table-row';
import { DeleteConfirmDialog } from '@/components/table/delete-confirm-dialog';
import { EditDialog } from '@/components/table/edit-dialog';
import type { EditField } from '@/components/table/edit-dialog';
import { TableEmptyState } from '@/components/table/empty-state';
import { ImportDialog } from '@/components/table/import-dialog';
import { Pagination, PaginationInfo } from '@/components/table/pagination';
import { TableActions } from '@/components/table/table-actions';
import { TableToolbar } from '@/components/table/table-toolbar';
import { ViewDialog } from '@/components/table/view-dialog';
import type { ViewField } from '@/components/table/view-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PeriodFilter } from '@/features/dashboard/overview/period-filter';
import type {
    CustomRange,
    Period,
} from '@/features/dashboard/overview/period-filter';
import {
    normalizeDateString,
    resolveDateRange,
} from '@/features/dashboard/overview/period-range';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { exportToExcel } from '@/lib/export-excel';
import { exportToPDF } from '@/lib/export-pdf';
import { cn } from '@/lib/utils';

export interface Column<T> {
    key: string;
    header: string | React.ReactNode;
    render?: (value: unknown, row: T) => React.ReactNode;
}

export interface GenericTableProps<T extends { id: string }> {
    showPrint?: boolean;
    data: T[];
    columns: Column<T>[];
    title: string;
    loading?: boolean;
    searchPlaceholder?: string;
    sortableColumns?: Array<{
        key: string;
        type: 'text' | 'date';
    }>;
    dateFilterKey?: string;
    onView?: (row: T) => void;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void | Promise<void>;
    onCreate?: (data: T) => void | Promise<void>;
    onImport?: (data: T[]) => void;
    className?: string;
    routeUrl?: string;
    showActions?: boolean;
    clickableRow?: boolean;
    onRowClick?: (row: T) => void;
    showMobileList?: boolean;
    rowClassName?: string | ((row: T, index: number) => string | undefined);
    createFields?: FormField[];
    createDialog?: (params: {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        onSubmit: (data: T) => void;
        title: string;
    }) => React.ReactNode;
    editDialog?: (params: {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        onSubmit: (data: T) => void;
        title: string;
        row: T;
    }) => React.ReactNode;
    isCreateOpen?: boolean;
    onCreateOpenChange?: (open: boolean) => void;
    onFilteredDataChange?: (data: T[]) => void;
}

export function GenericTable<T extends { id: string }>({
    data,
    columns,
    title,
    loading = false,
    searchPlaceholder,
    sortableColumns = [],
    dateFilterKey,
    onView,
    onEdit,
    onDelete,
    onCreate,
    onImport,
    className,
    routeUrl,
    showActions = true,
    showPrint = false,
    clickableRow = false,
    onRowClick,
    createFields,
    createDialog,
    editDialog,
    isCreateOpen: externalIsCreateOpen,
    onCreateOpenChange: externalOnCreateOpenChange,
    onFilteredDataChange,
    rowClassName,
}: GenericTableProps<T>) {
    const [internalIsCreateOpen, setInternalIsCreateOpen] =
        React.useState(false);
    const [isImportOpen, setIsImportOpen] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState<T | null>(null);
    const [isViewOpen, setIsViewOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

    const {
        search,
        currentPage,
        perPage,
        sortBy,
        sortDirection,
        period,
        customRange,
        setSearch,
        setCurrentPage,
        setSortBy,
        setSortDirection,
        setPeriod,
        setCustomRange,
        updateUrl,
    } = useTableQueryState(routeUrl);

    const resolvedCreateFields = React.useMemo<FormField[]>(() => {
        if (createFields && createFields.length > 0) {
            return createFields;
        }

        return columns
            .map((column) => {
                if (typeof column.header !== 'string') {
                    return null;
                }

                return {
                    key: column.key,
                    label: column.header,
                };
            })
            .filter(
                (
                    field,
                ): field is {
                    key: string;
                    label: string;
                } => field !== null,
            )
            .filter(
                (field) =>
                    !['id', 'createdAt', 'updatedAt', 'deletedAt'].includes(
                        field.key,
                    ),
            )
            .map((field) => {
                const key = field.key.toLowerCase();
                const inferredType: FormField['type'] = key.includes('email')
                    ? 'email'
                    : key.includes('password')
                      ? 'password'
                      : key.includes('date')
                        ? 'date'
                        : 'text';

                const placeholder =
                    inferredType === 'date'
                        ? 'Selecione uma data'
                        : `Digite ${field.label.toLowerCase()}`;

                return {
                    name: field.key,
                    label: field.label,
                    type: inferredType,
                    placeholder,
                    required: true,
                };
            });
    }, [columns, createFields]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        updateUrl({ search: value, page: 1 });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        updateUrl({ page });
    };

    const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
        setSortBy(field);
        setSortDirection(direction);
        updateUrl({ sortBy: field, sortDirection: direction, page: 1 });
    };

    const handlePeriodChange = (
        nextPeriod: Period,
        nextCustomRange?: CustomRange,
    ) => {
        setPeriod(nextPeriod);

        const nextRange =
            nextPeriod === 'custom' && nextCustomRange
                ? nextCustomRange
                : customRange;

        if (nextPeriod === 'custom' && nextCustomRange) {
            setCustomRange(nextCustomRange);
        }

        updateUrl({
            period: nextPeriod,
            dateFrom: nextPeriod === 'custom' ? nextRange.from : undefined,
            dateTo: nextPeriod === 'custom' ? nextRange.to : undefined,
            page: 1,
        });
    };

    const sortableMap = React.useMemo(
        () => new Map(sortableColumns.map((column) => [column.key, column])),
        [sortableColumns],
    );

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

        if (dateFilterKey && period !== 'all') {
            const range = resolveDateRange(period, customRange);

            if (range) {
                result = result.filter((item) => {
                    const rawValue = (item as Record<string, unknown>)[
                        dateFilterKey
                    ];
                    const normalizedDate = normalizeDateString(rawValue);

                    if (!normalizedDate) {
                        return false;
                    }

                    return (
                        normalizedDate >= range.from &&
                        normalizedDate <= range.to
                    );
                });
            }
        }

        return result;
    }, [customRange, data, dateFilterKey, period, search]);

    React.useEffect(() => {
        onFilteredDataChange?.(filteredData);
    }, [filteredData, onFilteredDataChange]);

    const sortedData = React.useMemo(() => {
        if (!sortBy) {
            return filteredData;
        }

        return [...filteredData].sort((first, second) => {
            const firstValue = (first as Record<string, unknown>)[sortBy];
            const secondValue = (second as Record<string, unknown>)[sortBy];
            const sortableColumn = sortableMap.get(sortBy);

            if (sortableColumn?.type === 'date') {
                const firstDate = normalizeDateString(firstValue) || '';
                const secondDate = normalizeDateString(secondValue) || '';
                const comparison = firstDate.localeCompare(secondDate);

                return sortDirection === 'asc' ? comparison : comparison * -1;
            }

            const comparison =
                typeof firstValue === 'number' &&
                typeof secondValue === 'number'
                    ? firstValue - secondValue
                    : String(firstValue ?? '').localeCompare(
                          String(secondValue ?? ''),
                          'pt-BR',
                          { numeric: true },
                      );

            return sortDirection === 'asc' ? comparison : comparison * -1;
        });
    }, [filteredData, sortBy, sortDirection, sortableMap]);

    const paginatedData = React.useMemo(() => {
        const start = (currentPage - 1) * perPage;

        return sortedData.slice(start, start + perPage);
    }, [currentPage, perPage, sortedData]);

    const totalPages = Math.ceil(filteredData.length / perPage);

    const handleExportExcel = async () => {
        await exportToExcel(
            sortedData as unknown as Record<string, unknown>[],
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
            sortedData as unknown as Record<string, unknown>[],
            pdfColumns as never,
            { fileName: title, title },
        );
    };

    const handleView = (row: T) => {
        setSelectedRow(row);
        setIsViewOpen(true);
        onView?.(row);
    };

    const handleEdit = (row: T) => {
        if (onEdit) {
            onEdit(row);

            return;
        }

        setSelectedRow(row);
        setIsEditOpen(true);
    };

    const handleDelete = (row: T) => {
        setSelectedRow(row);
        setIsDeleteOpen(true);
    };

    const handleImport = (importedData: Record<string, unknown>[]) => {
        onImport?.(importedData as T[]);
        setIsImportOpen(false);
    };

    const viewFields: ViewField[] = React.useMemo(() => {
        if (!selectedRow) {
            return [];
        }

        return columns.map((column) => {
            const value = (selectedRow as Record<string, unknown>)[column.key];

            return {
                label: String(column.header),
                value: column.render
                    ? column.render(value, selectedRow)
                    : String(value ?? ''),
            };
        });
    }, [columns, selectedRow]);

    const editFields: EditField[] = React.useMemo(
        () =>
            columns.map((column) => ({
                name: column.key,
                label: String(column.header),
                required: true,
                type:
                    typeof (selectedRow as Record<string, unknown> | null)?.[
                        column.key
                    ] === 'number'
                        ? 'number'
                        : 'text',
            })),
        [columns, selectedRow],
    );

    const isCreateOpenValue = externalIsCreateOpen ?? internalIsCreateOpen;
    const handleCreateOpenChange = (open: boolean) => {
        if (externalOnCreateOpenChange) {
            externalOnCreateOpenChange(open);
        } else {
            setInternalIsCreateOpen(open);
        }
    };

    const renderSortHeader = (column: Column<T>) => {
        const sortableColumn = sortableMap.get(column.key);

        if (!sortableColumn || typeof column.header !== 'string') {
            return column.header;
        }

        const isActive = sortBy === column.key;
        const nextDirection =
            sortableColumn.type === 'date'
                ? isActive && sortDirection === 'desc'
                    ? 'asc'
                    : 'desc'
                : isActive && sortDirection === 'asc'
                  ? 'desc'
                  : 'asc';

        return (
            <button
                type="button"
                onClick={() => handleSortChange(column.key, nextDirection)}
                className="inline-flex items-center gap-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
                <span>{column.header}</span>
                {isActive ? (
                    sortableColumn.type === 'date' ? (
                        sortDirection === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                        ) : (
                            <ArrowDown className="h-4 w-4" />
                        )
                    ) : sortDirection === 'asc' ? (
                        <ArrowDownAZ className="h-4 w-4" />
                    ) : (
                        <ArrowUpZA className="h-4 w-4" />
                    )
                ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-60" />
                )}
            </button>
        );
    };

    const skeletonRowCount = 6;

    const resolveRowClassName = (row: T, index: number): string | undefined => {
        if (typeof rowClassName === 'function') {
            return rowClassName(row, index);
        }

        return rowClassName;
    };

    return (
        <div className={cn('space-y-4', className)}>
            <TableToolbar
                searchValue={search}
                searchPlaceholder={searchPlaceholder}
                onSearchChange={handleSearchChange}
                showCreate={!!onCreate || !!createDialog}
                onCreate={() => handleCreateOpenChange(true)}
                showImport
                onImport={() => setIsImportOpen(true)}
                onExportExcel={handleExportExcel}
                onExportPDF={handleExportPDF}
                extraContent={
                    dateFilterKey ? (
                        <PeriodFilter
                            period={period}
                            customRange={customRange}
                            onPeriodChange={handlePeriodChange}
                        />
                    ) : null
                }
            />

            <div className="hidden md:block">
                {loading ? (
                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    {columns.map((col: Column<T>) => (
                                        <DataTableHeadCell key={col.key}>
                                            {typeof col.header === 'string'
                                                ? col.header
                                                : col.header}
                                        </DataTableHeadCell>
                                    ))}
                                    {showActions && (
                                        <DataTableHeadCell className="w-36 text-right">
                                            Ações
                                        </DataTableHeadCell>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({
                                    length: skeletonRowCount,
                                }).map((_, rowIndex) => (
                                    <tr
                                        key={`table-skeleton-${rowIndex}`}
                                        className="border-b last:border-0"
                                    >
                                        {columns.map((column) => (
                                            <DataTableCell key={column.key}>
                                                <Skeleton className="h-5 w-full max-w-[180px]" />
                                            </DataTableCell>
                                        ))}
                                        {showActions && (
                                            <DataTableCell className="w-36">
                                                <div className="flex justify-end gap-2">
                                                    <Skeleton className="h-8 w-8 rounded-md" />
                                                    <Skeleton className="h-8 w-8 rounded-md" />
                                                    <Skeleton className="h-8 w-8 rounded-md" />
                                                </div>
                                            </DataTableCell>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <DataTable
                        data={paginatedData}
                        emptyMessage="Nenhum registro encontrado"
                    >
                        <thead>
                            <tr>
                                {columns.map((col: Column<T>) => (
                                    <DataTableHeadCell key={col.key}>
                                        {renderSortHeader(col)}
                                    </DataTableHeadCell>
                                ))}
                                {showActions && (
                                    <DataTableHeadCell className="w-36 text-right">
                                        Ações
                                    </DataTableHeadCell>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={
                                            columns.length +
                                            (showActions ? 1 : 0)
                                        }
                                    >
                                        <TableEmptyState
                                            searchTerm={search}
                                            onClearSearch={() =>
                                                handleSearchChange('')
                                            }
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
                                        onClick={
                                            clickableRow && onRowClick
                                                ? () => onRowClick(row)
                                                : clickableRow && onEdit
                                                  ? () => onEdit(row)
                                                  : undefined
                                        }
                                        className={
                                            clickableRow &&
                                            (onRowClick || onEdit)
                                                ? cn(
                                                      'cursor-pointer',
                                                      resolveRowClassName(
                                                          row,
                                                          index,
                                                      ),
                                                  )
                                                : resolveRowClassName(
                                                      row,
                                                      index,
                                                  )
                                        }
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
                                        {showActions && (
                                            <DataTableCell className="w-36">
                                                <TableActions
                                                    onView={() =>
                                                        handleView(row)
                                                    }
                                                    onEdit={() =>
                                                        handleEdit(row)
                                                    }
                                                    onDelete={
                                                        onDelete
                                                            ? () =>
                                                                  handleDelete(
                                                                      row,
                                                                  )
                                                            : undefined
                                                    }
                                                    showPrint={showPrint}
                                                />
                                            </DataTableCell>
                                        )}
                                    </DataTableRowZebra>
                                ))
                            )}
                        </tbody>
                    </DataTable>
                )}
            </div>

            <div className="block space-y-2 md:hidden">
                {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={`mobile-skeleton-${index}`}
                            className="rounded-lg border bg-card p-3"
                        >
                            <div className="space-y-3">
                                {Array.from({
                                    length: Math.min(columns.length, 4),
                                }).map((__, cellIndex) => (
                                    <div
                                        key={`mobile-skeleton-cell-${cellIndex}`}
                                        className="flex justify-between gap-3"
                                    >
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-28" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : paginatedData.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        Nenhum registro encontrado
                    </div>
                ) : (
                    paginatedData.map((row: T, index: number) => (
                        <div
                            key={String((row as { id: string }).id)}
                            className={cn(
                                'rounded-lg border bg-card p-3',
                                resolveRowClassName(row, index),
                            )}
                        >
                            {columns.map((col: Column<T>) => (
                                <div
                                    key={col.key}
                                    className="flex justify-between gap-2 py-1"
                                >
                                    <span className="text-xs text-muted-foreground">
                                        {col.header}
                                    </span>
                                    <span className="text-sm font-medium">
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
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-between gap-4">
                    <Skeleton className="h-5 w-40" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-9 rounded-md" />
                        <Skeleton className="h-9 w-9 rounded-md" />
                        <Skeleton className="h-9 w-9 rounded-md" />
                    </div>
                </div>
            ) : (
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
            )}

            <ImportDialog
                open={isImportOpen}
                onOpenChange={setIsImportOpen}
                onImport={handleImport}
            />

            <ViewDialog
                open={isViewOpen}
                onOpenChange={setIsViewOpen}
                title={`Detalhes de ${title}`}
                fields={viewFields}
            />

            {selectedRow &&
                (editDialog ? (
                    editDialog({
                        open: isEditOpen,
                        onOpenChange: setIsEditOpen,
                        title: `Editar ${title}`,
                        row: selectedRow,
                        onSubmit: (data) => {
                            try {
                                onEdit?.(data as T);
                                toast.success(
                                    `${title}: registro atualizado com sucesso.`,
                                );
                                setIsEditOpen(false);
                            } catch (error) {
                                const message =
                                    error instanceof Error && error.message
                                        ? error.message
                                        : `${title}: erro ao atualizar o registro.`;

                                toast.error(message);
                            }
                        },
                    })
                ) : (
                    <EditDialog
                        open={isEditOpen}
                        onOpenChange={setIsEditOpen}
                        title={`Editar ${title}`}
                        fields={editFields}
                        initialData={
                            selectedRow as unknown as Record<string, unknown>
                        }
                        onSubmit={(data) => {
                            try {
                                onEdit?.(data as T);
                                toast.success(
                                    `${title}: registro atualizado com sucesso.`,
                                );
                                setIsEditOpen(false);
                            } catch (error) {
                                const message =
                                    error instanceof Error && error.message
                                        ? error.message
                                        : `${title}: erro ao atualizar o registro.`;

                                toast.error(message);
                            }
                        }}
                    />
                ))}

            <DeleteConfirmDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title={`Excluir ${title}`}
                description="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
                itemName={
                    selectedRow
                        ? String(
                              (selectedRow as Record<string, unknown>).name ??
                                  (selectedRow as Record<string, unknown>)
                                      .clientName ??
                                  (selectedRow as Record<string, unknown>)
                                      .supplierName ??
                                  selectedRow.id,
                          )
                        : undefined
                }
                onConfirm={async () => {
                    try {
                        if (!selectedRow || !onDelete) {
                            setIsDeleteOpen(false);

                            return;
                        }

                        await onDelete(selectedRow);

                        toast.success(
                            `${title}: registro excluido com sucesso.`,
                        );
                        setIsDeleteOpen(false);
                        setSelectedRow(null);
                    } catch (error) {
                        const message =
                            error instanceof Error && error.message
                                ? error.message
                                : `${title}: erro ao excluir o registro.`;

                        toast.error(message);
                    }
                }}
            />

            {createDialog ? (
                createDialog({
                    open: isCreateOpenValue,
                    onOpenChange: handleCreateOpenChange,
                    title: `Criar Novo ${title}`,
                    onSubmit: async (data) => {
                        try {
                            await onCreate?.(data);
                            toast.success(
                                `${title}: registro criado com sucesso.`,
                            );
                            handleCreateOpenChange(false);
                        } catch (error) {
                            const message =
                                error instanceof Error && error.message
                                    ? error.message
                                    : `${title}: erro ao criar o registro.`;

                            toast.error(message);
                        }
                    },
                })
            ) : (
                <CreateModal
                    open={isCreateOpenValue}
                    onOpenChange={handleCreateOpenChange}
                    title={`Criar Novo ${title}`}
                    description="Preencha os dados abaixo para criar um novo registro."
                    fields={resolvedCreateFields}
                    onSubmit={async (data) => {
                        try {
                            await onCreate?.(data as T);
                            toast.success(
                                `${title}: registro criado com sucesso.`,
                            );
                            handleCreateOpenChange(false);
                        } catch (error) {
                            const message =
                                error instanceof Error && error.message
                                    ? error.message
                                    : `${title}: erro ao criar o registro.`;

                            toast.error(message);
                        }
                    }}
                />
            )}
        </div>
    );
}
