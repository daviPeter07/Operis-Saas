import { PersonTypeBadge } from '@/components/common/person-type-badge';
import { useCreateSupplier, useSuppliers } from '@/hooks/use-suppliers';
import { inferPersonType } from '@/utils/clients';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { SupplierCreateDialog } from './supplier-create-dialog';

type SupplierRow = {
    id: string;
    name: string;
    email: string;
    phone: string;
    document: string;
    status: 'active' | 'inactive';
};

export function SuppliersModule() {
    const { data: suppliers = [] } = useSuppliers();
    const createSupplier = useCreateSupplier();

    const columns: Column<SupplierRow>[] = [
        { key: 'name', header: 'Nome' },
        {
            key: 'personType',
            header: 'Tipo',
            render: (_value: unknown, row: SupplierRow) => (
                <PersonTypeBadge personType={inferPersonType(row.document)} />
            ),
        },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Telefone' },
        { key: 'document', header: 'Documento' },
        { key: 'status', header: 'Status' },
    ];

    const rows: SupplierRow[] = suppliers.map((supplier) => ({
        id: String(supplier.id),
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        document: supplier.document,
        status: supplier.status,
    }));

    const handleCreate = async (data: {
        name: string;
        email: string;
        phone: string;
        document: string;
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
        });
    };

    return (
        <GenericTable
            data={rows}
            columns={columns}
            title="Fornecedores"
            onCreate={handleCreate as (data: SupplierRow) => Promise<void>}
            createDialog={({ open, onOpenChange, onSubmit }) => (
                <SupplierCreateDialog
                    open={open}
                    onOpenChange={onOpenChange}
                    onSubmit={(payload) => {
                        void onSubmit({
                            id: '',
                            status: 'active',
                            ...payload,
                        });
                    }}
                />
            )}
        />
    );
}
