import { PersonTypeBadge } from '@/components/common/person-type-badge';
import {
    useCreateCustomer,
    useCustomers,
    useDeleteCustomer,
} from '@/hooks/use-customers';
import { inferClientPersonType } from '@/utils/clients';
import { formatDocumentInput, formatPhoneInput } from '@/utils/form-fields';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { ClientCreateDialog } from './client-create-dialog';

type ClientRow = {
    id: string;
    name: string;
    email: string;
    phone: string;
    document: string;
    status: 'active' | 'inactive';
    personType: 'pf' | 'pj';
};

export function ClientsModule() {
    const { data: customers = [] } = useCustomers();
    const createCustomer = useCreateCustomer();
    const deleteCustomer = useDeleteCustomer();

    const rows: ClientRow[] = customers.map((customer) => ({
        id: String(customer.id),
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        document: customer.document,
        status: customer.status,
        personType: inferClientPersonType(customer.document || ''),
    }));

    const columns: Column<ClientRow>[] = [
        { key: 'name', header: 'Nome' },
        {
            key: 'personType',
            header: 'Tipo',
            render: (_value: unknown, row: ClientRow) => (
                <PersonTypeBadge personType={row.personType} />
            ),
        },
        { key: 'email', header: 'Email' },
        {
            key: 'phone',
            header: 'Telefone',
            render: (value: unknown) => formatPhoneInput(String(value ?? '')),
        },
        {
            key: 'document',
            header: 'Documento',
            render: (value: unknown) =>
                formatDocumentInput(String(value ?? '')),
        },
    ];

    const handleCreate = async (data: {
        name: string;
        email: string;
        phone: string;
        document: string;
        person_type?: string;
    }) => {
        const name = String(data.name || '').trim();

        if (!name) {
            throw new Error('Informe o nome do cliente');
        }

        await createCustomer.mutateAsync({
            name,
            email: String(data.email || '').trim(),
            phone: String(data.phone || '').trim(),
            document: String(data.document || '').trim(),
            person_type: data.person_type || 'pf',
        });
    };

    return (
        <GenericTable
            data={rows}
            columns={columns}
            title="Clientes"
            routeUrl="/dashboard/clients"
            onCreate={handleCreate as (data: ClientRow) => Promise<void>}
            onDelete={async (row) => {
                await deleteCustomer.mutateAsync(Number(row.id));
            }}
            createDialog={({ open, onOpenChange }) => (
                <ClientCreateDialog
                    open={open}
                    onOpenChange={onOpenChange}
                />
            )}
        />
    );
}
