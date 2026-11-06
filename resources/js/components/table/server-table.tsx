import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    FilterX,
    SlidersHorizontal,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { ColumnFilter } from '@/components/table/column-filter';
import type { ColumnFilterConfig } from '@/components/table/column-filter';
import { DataTableCell } from '@/components/table/data-table';
import { DataTableRowZebra } from '@/components/table/data-table-row';
import { DeleteConfirmDialog } from '@/components/table/delete-confirm-dialog';
import { HighlightText } from '@/components/table/highlight-text';
import { Pagination, PaginationInfo } from '@/components/table/pagination';
import { TableActions } from '@/components/table/table-actions';
import { TableToolbar } from '@/components/table/table-toolbar';
import { ViewDialog } from '@/components/table/view-dialog';
import type { ViewField } from '@/components/table/view-dialog';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { PeriodFilter } from '@/features/dashboard/overview/period-filter';
import type { ServerTableState } from '@/hooks/use-server-table-state';
import { exportToExcel } from '@/lib/export-excel';
import { exportToPDF } from '@/lib/export-pdf';
import { cn } from '@/lib/utils';

export interface ServerColumn<T> {
    key: keyof T & string;
    header: string;
    render?: (row: T) => React.ReactNode;
    sortKey?: string;
    filter?: ColumnFilterConfig;
    className?: string;
}

export interface ServerTableProps<T extends { id: string }> {
    title: string;
    columns: ServerColumn<T>[];
    rows: T[];
    total: number;
    lastPage: number;
    isLoading: boolean;
    isFetching?: boolean;
    state: ServerTableState;
    showPeriodFilter?: boolean;
    onCreate?: () => void;
    onView?: (row: T) => void;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => Promise<void> | void;
    loadAllForExport?: () => Promise<T[]>;
    exportColumns?: ServerColumn<T>[];
    itemName?: (row: T) => string;
    rowClassName?: (row: T) => string | undefined;
}

export function ServerTable<T extends { id: string }>({
    title,
    columns,
    rows,
    total,
    lastPage,
    isLoading,
    isFetching = false,
    state,
    showPeriodFilter = true,
    onCreate,
    onView,
    onEdit,
    onDelete,
    loadAllForExport,
    exportColumns = columns,
    itemName,
    rowClassName,
}: ServerTableProps<T>) {
    const [viewRow, setViewRow] = React.useState<T | null>(null);
    const [deleteRow, setDeleteRow] = React.useState<T | null>(null);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);
    const hasFilters = columns.some((column) => column.filter);
    const showActions = Boolean(onEdit || onDelete);
    const openView = (row: T) => (onView ? onView(row) : setViewRow(row));

    const renderCell = (column: ServerColumn<T>, row: T) =>
        column.render ? column.render(row) : String(row[column.key] ?? '');

    const renderDisplayCell = (column: ServerColumn<T>, row: T) => {
        const content = renderCell(column, row);
        const query =
            column.filter?.type === 'text'
                ? state.filters[column.filter.key]
                : undefined;

        return query && typeof content === 'string' ? (
            <HighlightText text={content} query={query} />
        ) : (
            content
        );
    };

    const exportRows = async (format: 'excel' | 'pdf') => {
        const allRows = loadAllForExport ? await loadAllForExport() : rows;
        const exportData = allRows.map((row) =>
            Object.fromEntries(
                exportColumns.map((column) => [
                    column.header,
                    column.render
                        ? textOf(column.render(row))
                        : row[column.key],
                ]),
            ),
        );

        if (format === 'excel') {
            await exportToExcel(exportData, { fileName: title });

            return;
        }

        await exportToPDF(
            exportData,
            exportColumns.map((column) => ({
                key: column.header,
                header: column.header,
            })) as never,
            { fileName: title, title },
        );
    };

    const viewFields: ViewField[] = viewRow
        ? columns.map((column) => ({
              label: column.header,
              value: renderCell(column, viewRow),
          }))
        : [];

    return (
        <div className="space-y-4">
            <TableToolbar
                showSearch={false}
                createPosition="start"
                showCreate={Boolean(onCreate)}
                onCreate={onCreate}
                showImport={false}
                onExportExcel={() => void exportRows('excel')}
                onExportPDF={() => void exportRows('pdf')}
                startContent={
                    hasFilters ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto gap-2 md:hidden"
                            onClick={() => setIsMobileFiltersOpen(true)}
                        >
                            <SlidersHorizontal className="size-4" />
                            Filtros
                            {state.hasActiveFilters ? (
                                <span className="size-2 rounded-full bg-accent" />
                            ) : null}
                        </Button>
                    ) : null
                }
                extraContent={
                    <>
                        {state.hasActiveFilters ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                                onClick={state.clearFilters}
                            >
                                <FilterX className="size-4" />
                                Limpar filtros
                            </Button>
                        ) : null}
                        {showPeriodFilter ? (
                            <PeriodFilter
                                period={state.period}
                                customRange={state.customRange}
                                onPeriodChange={state.setPeriod}
                            />
                        ) : null}
                    </>
                }
            />

            <div className="hidden overflow-x-auto rounded-md border md:block">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    scope="col"
                                    aria-sort={ariaSort(state, column.sortKey)}
                                    className={cn(
                                        'px-4 pt-3 pb-2 text-left align-top font-bold whitespace-nowrap text-foreground',
                                        column.filter && 'min-w-40',
                                        column.className,
                                    )}
                                >
                                    <SortableHeader
                                        column={column}
                                        state={state}
                                    />
                                    {column.filter ? (
                                        <ColumnFilter
                                            config={column.filter}
                                            label={column.header}
                                            variant="underline"
                                            className="mt-1 min-w-0"
                                            value={
                                                state.filters[
                                                    column.filter.key
                                                ] ?? ''
                                            }
                                            onChange={(value) =>
                                                state.setFilter(
                                                    column.filter!.key,
                                                    value,
                                                )
                                            }
                                        />
                                    ) : null}
                                </th>
                            ))}
                            {showActions ? (
                                <th
                                    scope="col"
                                    className="w-32 px-4 pt-3 pb-2 text-right align-top font-medium text-muted-foreground"
                                >
                                    Ações
                                </th>
                            ) : null}
                        </tr>
                    </thead>
                    <tbody
                        className={cn(
                            'transition-opacity',
                            isFetching && !isLoading && 'opacity-60',
                        )}
                        aria-busy={isFetching}
                    >
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, index) => (
                                <tr key={index} className="border-b">
                                    {columns.map((column) => (
                                        <DataTableCell key={column.key}>
                                            <Skeleton className="h-5 w-full max-w-40" />
                                        </DataTableCell>
                                    ))}
                                    {showActions ? (
                                        <DataTableCell>
                                            <Skeleton className="ml-auto h-8 w-20" />
                                        </DataTableCell>
                                    ) : null}
                                </tr>
                            ))
                        ) : rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={
                                        columns.length + (showActions ? 1 : 0)
                                    }
                                >
                                    <EmptyResults state={state} />
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, index) => (
                                <DataTableRowZebra
                                    key={row.id}
                                    index={index}
                                    className={rowClassName?.(row)}
                                >
                                    {columns.map((column) => (
                                        <DataTableCell
                                            key={column.key}
                                            className={column.className}
                                        >
                                            {renderDisplayCell(column, row)}
                                        </DataTableCell>
                                    ))}
                                    {showActions ? (
                                        <DataTableCell className="w-32">
                                            <TableActions
                                                onView={() => openView(row)}
                                                onEdit={
                                                    onEdit
                                                        ? () => onEdit(row)
                                                        : undefined
                                                }
                                                onDelete={
                                                    onDelete
                                                        ? () =>
                                                              setDeleteRow(row)
                                                        : undefined
                                                }
                                            />
                                        </DataTableCell>
                                    ) : null}
                                </DataTableRowZebra>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div
                className={cn(
                    'space-y-2 transition-opacity md:hidden',
                    isFetching && !isLoading && 'opacity-60',
                )}
            >
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-28 w-full" />
                    ))
                ) : rows.length === 0 ? (
                    <EmptyResults state={state} />
                ) : (
                    rows.map((row) => (
                        <div
                            key={row.id}
                            className={cn(
                                'rounded-lg border bg-card p-3',
                                rowClassName?.(row),
                            )}
                        >
                            {columns.map((column) => (
                                <div
                                    key={column.key}
                                    className="flex justify-between gap-3 py-1"
                                >
                                    <span className="text-xs text-muted-foreground">
                                        {column.header}
                                    </span>
                                    <span className="text-right text-sm font-medium">
                                        {renderDisplayCell(column, row)}
                                    </span>
                                </div>
                            ))}
                            {showActions ? (
                                <TableActions
                                    className="mt-2 justify-end border-t pt-2"
                                    onView={() => openView(row)}
                                    onEdit={
                                        onEdit ? () => onEdit(row) : undefined
                                    }
                                    onDelete={
                                        onDelete
                                            ? () => setDeleteRow(row)
                                            : undefined
                                    }
                                />
                            ) : null}
                        </div>
                    ))
                )}
            </div>

            {isLoading ? (
                <Skeleton className="h-9 w-full max-w-sm" />
            ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <PaginationInfo
                        currentPage={state.page}
                        totalPages={lastPage}
                        totalItems={total}
                        itemsPerPage={state.perPage}
                    />
                    <Pagination
                        currentPage={state.page}
                        totalPages={lastPage}
                        onPageChange={state.setPage}
                    />
                </div>
            )}

            <Sheet
                open={isMobileFiltersOpen}
                onOpenChange={setIsMobileFiltersOpen}
            >
                <SheetContent
                    side="bottom"
                    className="max-h-[85dvh] overflow-y-auto"
                >
                    <SheetHeader>
                        <SheetTitle>Filtros</SheetTitle>
                        <SheetDescription>
                            Os resultados se atualizam conforme você filtra.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 px-4 pb-6">
                        <MobileSortSelect columns={columns} state={state} />
                        {columns
                            .filter((column) => column.filter)
                            .map((column) => (
                                <div key={column.key} className="grid gap-1.5">
                                    <span className="text-sm font-medium">
                                        {column.header}
                                    </span>
                                    <ColumnFilter
                                        config={column.filter!}
                                        label={column.header}
                                        className="w-full"
                                        value={
                                            state.filters[column.filter!.key] ??
                                            ''
                                        }
                                        onChange={(value) =>
                                            state.setFilter(
                                                column.filter!.key,
                                                value,
                                            )
                                        }
                                    />
                                </div>
                            ))}
                        {state.hasActiveFilters ? (
                            <Button
                                variant="outline"
                                onClick={state.clearFilters}
                                className="gap-2"
                            >
                                <FilterX className="size-4" />
                                Limpar filtros
                            </Button>
                        ) : null}
                    </div>
                </SheetContent>
            </Sheet>

            <ViewDialog
                open={viewRow !== null}
                onOpenChange={(open) => !open && setViewRow(null)}
                title={`Detalhes de ${title}`}
                fields={viewFields}
            />

            <DeleteConfirmDialog
                open={deleteRow !== null}
                onOpenChange={(open) => !open && setDeleteRow(null)}
                title={`Excluir ${title}`}
                description="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
                itemName={
                    deleteRow && itemName ? itemName(deleteRow) : undefined
                }
                onConfirm={async () => {
                    if (!deleteRow || !onDelete) {
                        return;
                    }

                    try {
                        await onDelete(deleteRow);
                        toast.success(
                            `${title}: registro excluído com sucesso.`,
                        );
                        setDeleteRow(null);
                    } catch (error) {
                        toast.error(
                            error instanceof Error && error.message
                                ? error.message
                                : `${title}: erro ao excluir o registro.`,
                        );
                    }
                }}
            />
        </div>
    );
}

function ariaSort(
    state: ServerTableState,
    sortKey?: string,
): 'ascending' | 'descending' | undefined {
    if (!sortKey || state.sort !== sortKey) {
        return undefined;
    }

    return state.direction === 'asc' ? 'ascending' : 'descending';
}

// Click cycle: largest first → smallest first → default order.
function SortableHeader<T>({
    column,
    state,
}: {
    column: ServerColumn<T>;
    state: ServerTableState;
}) {
    if (!column.sortKey) {
        return <>{column.header}</>;
    }

    const isActive = state.sort === column.sortKey;
    const current = isActive ? state.direction : null;
    const Icon =
        current === 'desc'
            ? ArrowDown
            : current === 'asc'
              ? ArrowUp
              : ArrowUpDown;

    const goToNextState = () => {
        if (current === null) {
            state.setSort(column.sortKey!, 'desc');
        } else if (current === 'desc') {
            state.setSort(column.sortKey!, 'asc');
        } else {
            state.clearSort();
        }
    };

    return (
        <button
            type="button"
            onClick={goToNextState}
            title={
                current === null
                    ? 'Ordenar do maior para o menor'
                    : current === 'desc'
                      ? 'Ordenar do menor para o maior'
                      : 'Voltar à ordem padrão'
            }
            className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
                isActive && 'text-foreground',
            )}
        >
            {column.header}
            <Icon
                aria-hidden
                className={cn('size-3.5', !isActive && 'opacity-50')}
            />
        </button>
    );
}

function MobileSortSelect<T>({
    columns,
    state,
}: {
    columns: ServerColumn<T>[];
    state: ServerTableState;
}) {
    const sortable = columns.filter((column) => column.sortKey);

    if (sortable.length === 0) {
        return null;
    }

    const value = state.sort ? `${state.sort}:${state.direction}` : 'default';

    return (
        <div className="grid gap-1.5">
            <span className="text-sm font-medium">Ordenar por</span>
            <Select
                value={value}
                onValueChange={(next) => {
                    if (next === 'default') {
                        state.clearSort();

                        return;
                    }

                    const [sort, direction] = next.split(':');
                    state.setSort(sort, direction === 'asc' ? 'asc' : 'desc');
                }}
            >
                <SelectTrigger aria-label="Ordenar por" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">Mais recentes</SelectItem>
                    {sortable.flatMap((column) => [
                        <SelectItem
                            key={`${column.sortKey}:desc`}
                            value={`${column.sortKey}:desc`}
                        >
                            {column.header}: maior para menor
                        </SelectItem>,
                        <SelectItem
                            key={`${column.sortKey}:asc`}
                            value={`${column.sortKey}:asc`}
                        >
                            {column.header}: menor para maior
                        </SelectItem>,
                    ])}
                </SelectContent>
            </Select>
        </div>
    );
}

function EmptyResults({ state }: { state: ServerTableState }) {
    return (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">
                {state.hasActiveFilters
                    ? 'Nenhum registro corresponde aos filtros.'
                    : 'Nenhum registro encontrado.'}
            </p>
            {state.hasActiveFilters ? (
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={state.clearFilters}
                >
                    <FilterX className="size-4" />
                    Limpar filtros
                </Button>
            ) : null}
        </div>
    );
}

function textOf(node: React.ReactNode): string {
    if (node === null || node === undefined || typeof node === 'boolean') {
        return '';
    }

    if (typeof node === 'string' || typeof node === 'number') {
        return String(node);
    }

    if (Array.isArray(node)) {
        return node.map(textOf).join('');
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
        return textOf(node.props.children);
    }

    return '';
}
