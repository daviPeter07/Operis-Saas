import * as React from 'react';
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
import { FilterSidebar } from '@/components/table/filter-sidebar';
import { ImportDialog } from '@/components/table/import-dialog';
import { Pagination, PaginationInfo } from '@/components/table/pagination';
import { TableActions } from '@/components/table/table-actions';
import { TableToolbar } from '@/components/table/table-toolbar';
import { ViewDialog } from '@/components/table/view-dialog';
import type { ViewField } from '@/components/table/view-dialog';
import type { FilterOperator } from '@/hooks/use-table-filters';
import { exportToExcel } from '@/lib/export-excel';
import { exportToPDF } from '@/lib/export-pdf';
import { cn } from '@/lib/utils';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { toast } from 'sonner';

export interface Column<T> {
    key: string;
    header: string | React.ReactNode;
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
    onCreate?: (data: T) => void;
    onImport?: (data: T[]) => void;
    className?: string;
    routeUrl?: string;
    showActions?: boolean;
    clickableRow?: boolean;
    onRowClick?: (row: T) => void;
    showMobileList?: boolean;
    createFields?: FormField[];
    createDialog?: (params: {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        onSubmit: (data: T) => void;
        title: string;
    }) => React.ReactNode;
    isCreateOpen?: boolean;
    onCreateOpenChange?: (open: boolean) => void;
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
    showActions = true,
    clickableRow = false,
    onRowClick,
    showMobileList = false,
    createFields,
    createDialog,
    isCreateOpen: externalIsCreateOpen,
    onCreateOpenChange: externalOnCreateOpenChange,
}: GenericTableProps<T>) {
    const [internalIsCreateOpen, setInternalIsCreateOpen] =
        React.useState(false);
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    const [filterOperators, setFilterOperators] = React.useState<
        Record<string, FilterOperator>
    >({});
    const [isImportOpen, setIsImportOpen] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState<T | null>(null);
    const [isViewOpen, setIsViewOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

    const {
        search,
        currentPage,
        perPage,
        filters,
        sortBy,
        sortDirection,
        setSearch,
        setCurrentPage,
        setPerPage,
        setFilters,
        setSortBy,
        setSortDirection,
        updateUrl,
    } = useTableQueryState(routeUrl);

    const allFilterFields = React.useMemo(() => {
        const configuredFields = new Map(
            filterFields.map((field) => [field.key, field]),
        );

        return columns.map((column) => {
            const configuredField = configuredFields.get(column.key);

            if (configuredField) {
                return configuredField;
            }

            if (typeof column.header !== 'string') {
                return null;
            }

            const values = data
                .map((item) => (item as Record<string, unknown>)[column.key])
                .filter((value) => value !== null && value !== undefined);
            const firstValue = values[0];

            if (typeof firstValue === 'number') {
                return {
                    key: column.key,
                    label: String(column.header),
                    type: 'number' as const,
                };
            }

            const uniqueOptions = Array.from(
                new Set(values.map((value) => String(value))),
            ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

            if (uniqueOptions.length > 0 && uniqueOptions.length <= 30) {
                return {
                    key: column.key,
                    label: String(column.header),
                    type: 'select' as const,
                    options: uniqueOptions.map((value) => ({
                        value,
                        label: value,
                    })),
                };
            }

            return {
                key: column.key,
                label: String(column.header),
                type: 'text' as const,
            };
        });
    }, [columns, data, filterFields]);

    const activeFilterFields = React.useMemo(
        () =>
            allFilterFields.filter(
                (
                    field,
                ): field is {
                    key: string;
                    label: string;
                    type: 'text' | 'number' | 'select' | 'date';
                    options?: { value: string; label: string }[];
                } => field !== null,
            ),
        [allFilterFields],
    );

    const resolvedCreateFields = React.useMemo<FormField[]>(() => {
        if (createFields && createFields.length > 0) {
            return createFields;
        }

        return activeFilterFields
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
                      : field.type;

                const placeholder =
                    inferredType === 'select'
                        ? `Selecione ${field.label.toLowerCase()}`
                        : inferredType === 'number'
                          ? 'Digite um valor'
                          : inferredType === 'date'
                            ? 'Selecione uma data'
                            : `Digite ${field.label.toLowerCase()}`;

                return {
                    name: field.key,
                    label: field.label,
                    type: inferredType,
                    placeholder,
                    required: true,
                    options:
                        inferredType === 'select' ? field.options : undefined,
                };
            });
    }, [activeFilterFields, createFields]);

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
        setFilterOperators({});
        updateUrl({ filters: {}, page: 1 });
    };

    const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
        setSortBy(field);
        setSortDirection(direction);
        updateUrl({ sortBy: field, sortDirection: direction, page: 1 });
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
                const field = activeFilterFields.find(
                    (item) => item.key === key,
                );
                const operator =
                    filterOperators[key] ||
                    (field?.type === 'text' ? 'contains' : 'eq');

                result = result.filter((item) => {
                    const rawValue = (item as Record<string, unknown>)[key];

                    if (operator === 'contains') {
                        return String(rawValue)
                            .toLowerCase()
                            .includes(value.toLowerCase());
                    }

                    if (operator === 'neq') {
                        return String(rawValue) !== value;
                    }

                    if (['gt', 'gte', 'lt', 'lte'].includes(operator)) {
                        const numericValue = Number(rawValue);
                        const numericFilter = Number(value);

                        if (
                            Number.isNaN(numericValue) ||
                            Number.isNaN(numericFilter)
                        ) {
                            return false;
                        }

                        if (operator === 'gt') {
                            return numericValue > numericFilter;
                        }

                        if (operator === 'gte') {
                            return numericValue >= numericFilter;
                        }

                        if (operator === 'lt') {
                            return numericValue < numericFilter;
                        }

                        if (operator === 'lte') {
                            return numericValue <= numericFilter;
                        }
                    }

                    return String(rawValue) === value;
                });
            }
        });

        return result;
    }, [activeFilterFields, data, filterOperators, filters, search]);

    const sortedData = React.useMemo(() => {
        if (!sortBy) {
            return filteredData;
        }

        return [...filteredData].sort((first, second) => {
            const firstValue = (first as Record<string, unknown>)[sortBy];
            const secondValue = (second as Record<string, unknown>)[sortBy];

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
    }, [filteredData, sortBy, sortDirection]);

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

    return (
        <div className={cn('space-y-4', className)}>
            <TableToolbar
                searchValue={search}
                onSearchChange={handleSearchChange}
                showCreate={!!onCreate}
                onCreate={() => handleCreateOpenChange(true)}
                showImport
                onImport={() => setIsImportOpen(true)}
                onExportExcel={handleExportExcel}
                onExportPDF={handleExportPDF}
                onOpenFilters={() => setIsFilterOpen(true)}
                hasActiveFilters={Object.values(filters).some((v) => v !== '')}
            />

            <div className="hidden md:block">
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
                                        columns.length + (showActions ? 1 : 0)
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
                                        clickableRow && (onRowClick || onEdit)
                                            ? 'cursor-pointer'
                                            : undefined
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
                                                onView={() => handleView(row)}
                                                onEdit={() => handleEdit(row)}
                                                onDelete={() =>
                                                    handleDelete(row)
                                                }
                                            />
                                        </DataTableCell>
                                    )}
                                </DataTableRowZebra>
                            ))
                        )}
                    </tbody>
                </DataTable>
            </div>

            <div className="block space-y-2 md:hidden">
                {paginatedData.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        Nenhum registro encontrado
                    </div>
                ) : (
                    paginatedData.map((row: T) => (
                        <div
                            key={String((row as { id: string }).id)}
                            className="rounded-lg border bg-card p-3"
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

            <FilterSidebar
                open={isFilterOpen}
                onOpenChange={setIsFilterOpen}
                fields={activeFilterFields}
                activeFilters={Object.entries(filters).map(
                    ([field, value]) => ({
                        id: field,
                        field,
                        operator: filterOperators[field] || 'eq',
                        value,
                    }),
                )}
                onAddFilter={(filter) => {
                    const nextFilters = {
                        ...filters,
                        [filter.field]: String(filter.value),
                    };

                    setFilters(nextFilters);
                    setFilterOperators((prev) => ({
                        ...prev,
                        [filter.field]: filter.operator,
                    }));
                    updateUrl({ filters: nextFilters, page: 1 });
                }}
                onRemoveFilter={(id) => {
                    const nextFilters = { ...filters };
                    delete nextFilters[id];

                    setFilters(nextFilters);
                    setFilterOperators((prev) => {
                        const nextOperators = { ...prev };
                        delete nextOperators[id];

                        return nextOperators;
                    });
                    updateUrl({ filters: nextFilters, page: 1 });
                }}
                onClearFilters={handleClearFilters}
                sortFields={columns.map((column) => ({
                    key: column.key,
                    label: String(column.header),
                }))}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
            />

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

            {selectedRow && (
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
            )}

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
                onConfirm={() => {
                    try {
                        if (selectedRow) {
                            onDelete?.(selectedRow);
                        }

                        toast.success(
                            `${title}: registro excluido com sucesso.`,
                        );
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
                    onSubmit: (data) => {
                        try {
                            onCreate?.(data);
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
                    onSubmit={(data) => {
                        try {
                            onCreate?.(data as T);
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
