import { PersonTypeBadge } from '@/components/common/person-type-badge';
import { StatusBadge } from '@/components/common/status-badge';
import {
    useCreateSupplier,
    useDeleteSupplier,
    useSuppliers,
} from '@/hooks/use-suppliers';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { SupplierCreateDialog } from './supplier-create-dialog';

type SupplierRow = {
    id: string;
    name: string;
    email: string;
    phone: string;
    document: string;
    personType: 'pf' | 'pj';
    city: string;
    status: 'active' | 'inactive';
};

export function SuppliersModule() {
    const { data: suppliers = [], isPending: isSuppliersPending } =
        useSuppliers();
    const createSupplier = useCreateSupplier();
    const deleteSupplier = useDeleteSupplier();

    const columns: Column<SupplierRow>[] = [
        { key: 'name', header: 'Nome' },
        {
            key: 'personType',
            header: 'Tipo',
            render: (_value: unknown, row: SupplierRow) => (
                <PersonTypeBadge personType={row.personType} />
            ),
        },
        {
            key: 'email',
            header: 'Email',
            render: (val: unknown) => String(val || '-'),
        },
        {
            key: 'phone',
            header: 'Telefone',
            render: (val: unknown) => String(val || '-'),
        },
        {
            key: 'document',
            header: 'Documento',
            render: (val: unknown) => String(val || '-'),
        },
        {
            key: 'city',
            header: 'Cidade',
            render: (val: unknown) => String(val || '-'),
        },
        {
            key: 'status',
            header: 'Status',
            render: (val: unknown) => <StatusBadge status={String(val)} />,
        },
    ];

    const rows: SupplierRow[] = suppliers.map((supplier) => ({
        id: String(supplier.id),
        name: supplier.name,
        email: supplier.email ?? '',
        phone: supplier.phone ?? '',
        document: supplier.document ?? '',
        personType: supplier.person_type,
        city: '',
        status: supplier.status,
    }));

    const handleCreate = async (data: {
        name: string;
        email: string;
        phone: string;
        document: string;
        person_type: 'pf' | 'pj';
    }) => {
        const name = String(data.name || '').trim();

        if (!name) {
            throw new Error('Informe o nome do fornecedor');
        }

        await createSupplier.mutateAsync({
            name,
            email: String(data.email || '').trim(),
            phone: String(data.phone || '').trim(),
            document: String(data.document || '').trim(),
            person_type: data.person_type,
        });
    };

    return (
        <GenericTable
            data={rows}
            columns={columns}
            title="Fornecedores"
            loading={isSuppliersPending}
            sortableColumns={[
                { key: 'name', type: 'text' },
                { key: 'email', type: 'text' },
                { key: 'document', type: 'text' },
            ]}
            onCreate={handleCreate as (data: SupplierRow) => Promise<void>}
            onDelete={async (row) => {
                await deleteSupplier.mutateAsync(Number(row.id));
            }}
            editDialog={({ open, onOpenChange, row }) => (
                <SupplierCreateDialog
                    open={open}
                    onOpenChange={onOpenChange}
                    mode="edit"
                    initialData={{
                        id: Number(row.id),
                        name: row.name,
                        email: row.email,
                        phone: row.phone,
                        document: row.document,
                        personType: row.personType,
                        status: row.status,
                    }}
                />
            )}
            createDialog={({ open, onOpenChange }) => (
                <SupplierCreateDialog open={open} onOpenChange={onOpenChange} />
            )}
        />
    );
}
