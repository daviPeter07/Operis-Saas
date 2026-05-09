import { useEffect, useState } from 'react';
import { PersonTypeBadge } from '@/components/common/person-type-badge';
import {
    useCreateCustomer,
    useCustomers,
    useDeleteCustomer,
} from '@/hooks/use-customers';
import { useAccountReceivables } from '@/hooks/use-account-receivables';
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
    credit_enabled: boolean;
    credit_limit: number;
    credit_term_days: number;
    open_crediario_count: number;
};

export function ClientsModule() {
    const [isCreateOpen, setIsCreateOpen] = useState(() => {
        const params = new URLSearchParams(window.location.search);

        return params.get('action') === 'create-client';
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get('action') === 'create-client') {
            window.history.replaceState({}, '', '/dashboard/clients');
        }
    }, []);
    const { data: customers = [], isPending: isCustomersPending } =
        useCustomers();
    const { data: receivables = [] } = useAccountReceivables();
    const createCustomer = useCreateCustomer();
    const deleteCustomer = useDeleteCustomer();
    const [editingClient, setEditingClient] = useState<ClientRow | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const rows: ClientRow[] = customers.map((customer) => ({
        id: String(customer.id),
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        document: customer.document,
        status: customer.status,
        personType: inferClientPersonType(customer.document || ''),
        credit_enabled: customer.credit_enabled,
        credit_limit: customer.credit_limit,
        credit_term_days: customer.credit_term_days,
        open_crediario_count: receivables.filter(
            (receivable) =>
                receivable.customer_id === customer.id &&
                receivable.status === 'pending',
        ).length,
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
        {
            key: 'email',
            header: 'Email',
            render: (value: unknown) => String(value || '-'),
        },
        {
            key: 'phone',
            header: 'Telefone',
            render: (value: unknown) =>
                String(value || '').trim().length > 0
                    ? formatPhoneInput(String(value))
                    : '-',
        },
        {
            key: 'document',
            header: 'Documento',
            render: (value: unknown) =>
                String(value || '').trim().length > 0
                    ? formatDocumentInput(String(value))
                    : '-',
        },
        {
            key: 'credit_enabled',
            header: 'Crediario',
            render: (value: unknown) => (value ? 'Habilitado' : 'Desabilitado'),
        },
        {
            key: 'open_crediario_count',
            header: 'Crediarios em aberto',
        },
        {
            key: 'credit_term_days',
            header: 'Prazo (dias)',
            render: (value: unknown) => Number(value || 0) || '-',
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
            credit_enabled: Boolean((data as Partial<ClientRow>).credit_enabled),
            credit_limit: Number((data as Partial<ClientRow>).credit_limit || 0),
            credit_term_days: Number((data as Partial<ClientRow>).credit_term_days || 30),
        });
    };

    return (
        <>
            <GenericTable
                data={rows}
                columns={columns}
                title="Clientes"
                loading={isCustomersPending}
                routeUrl="/dashboard/clients"
                sortableColumns={[
                    { key: 'name', type: 'text' },
                    { key: 'email', type: 'text' },
                    { key: 'document', type: 'text' },
                ]}
                onCreate={handleCreate as (data: ClientRow) => Promise<void>}
                onDelete={async (row) => {
                    await deleteCustomer.mutateAsync(Number(row.id));
                }}
                isCreateOpen={isCreateOpen}
                onCreateOpenChange={setIsCreateOpen}
                onEdit={(row) => {
                    setEditingClient(row);
                    setIsEditOpen(true);
                }}
                createDialog={({ open, onOpenChange }) => (
                    <ClientCreateDialog
                        open={open}
                        onOpenChange={onOpenChange}
                    />
                )}
            />
            {editingClient ? (
                <ClientCreateDialog
                    open={isEditOpen}
                    onOpenChange={(open) => {
                        setIsEditOpen(open);

                        if (!open) {
                            setEditingClient(null);
                        }
                    }}
                    initialData={{
                        id: Number(editingClient.id),
                        name: editingClient.name,
                        email: editingClient.email,
                        phone: editingClient.phone,
                        document: editingClient.document,
                        personType: editingClient.personType,
                        creditEnabled: editingClient.credit_enabled,
                        creditLimit: editingClient.credit_limit,
                        creditTermDays: editingClient.credit_term_days,
                        status: editingClient.status,
                    }}
                />
            ) : null}
        </>
    );
}
