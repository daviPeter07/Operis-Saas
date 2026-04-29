import * as React from 'react';
import {
    DataTable,
    DataTableHeadCell,
    DataTableCell,
} from '@/components/table/data-table';
import { DataTableRowZebra } from '@/components/table/data-table-row';
import { TableEmptyState } from '@/components/table/empty-state';
import { FilterSidebar } from '@/components/table/filter-sidebar';
import { Pagination, PaginationInfo } from '@/components/table/pagination';
import { TableActions } from '@/components/table/table-actions';
import { TableToolbar } from '@/components/table/table-toolbar';
import { useTablePagination } from '@/hooks/use-table-pagination';
import { useTableSearch } from '@/hooks/use-table-search';
import type { Client } from '@/lib/mocks/mock-data';
import { cn } from '@/lib/utils';

interface ClientsTableProps {
    data: Client[];
    className?: string;
}

export function ClientsTable({ data, className }: ClientsTableProps) {
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    const { pagination, goToPage } = useTablePagination({ total: data.length });

    const columns = [
        { key: 'name', header: 'Nome' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Telefone' },
        { key: 'document', header: 'Documento' },
        { key: 'city', header: 'Cidade' },
        { key: 'state', header: 'Estado' },
    ];

    const filterFields = [
        {
            key: 'city',
            label: 'Cidade',
            type: 'select' as const,
            options: [...new Set(data.map((c) => c.city))].map((v) => ({
                value: v,
                label: v,
            })),
        },
        {
            key: 'state',
            label: 'Estado',
            type: 'select' as const,
            options: [...new Set(data.map((c) => c.state))].map((v) => ({
                value: v,
                label: v,
            })),
        },
    ];

    const filteredData = React.useMemo(() => {
        if (!search || search.trim() === '') {
            return data;
        }

        const normalizedSearch = search.toLowerCase().trim();

        return data.filter((item) =>
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
                showCreate
                onCreate={() => {}}
                showImport
                onImport={() => {}}
                onOpenFilters={() => setIsFilterOpen(true)}
            />

            <DataTable
                data={paginatedData}
                emptyMessage="Nenhum cliente encontrado"
            >
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <DataTableHeadCell key={col.key}>
                                {col.header}
                            </DataTableHeadCell>
                        ))}
                        <DataTableHeadCell>Ações</DataTableHeadCell>
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
                        paginatedData.map((client, index) => (
                            <DataTableRowZebra key={client.id} index={index}>
                                <DataTableCell>
                                    {String(client.name)}
                                </DataTableCell>
                                <DataTableCell>
                                    {String(client.email)}
                                </DataTableCell>
                                <DataTableCell>
                                    {String(client.phone)}
                                </DataTableCell>
                                <DataTableCell>
                                    {String(client.document)}
                                </DataTableCell>
                                <DataTableCell>
                                    {String(client.city)}
                                </DataTableCell>
                                <DataTableCell>
                                    {String(client.state)}
                                </DataTableCell>
                                <DataTableCell>
                                    <TableActions
                                        onView={() => {}}
                                        onEdit={() => {}}
                                        onDelete={() => {}}
                                    />
                                </DataTableCell>
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

            <FilterSidebar
                open={isFilterOpen}
                onOpenChange={setIsFilterOpen}
                fields={filterFields}
            />
        </div>
    );
}
