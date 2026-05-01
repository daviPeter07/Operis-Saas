import { mockClients } from '@/lib/mocks/mock-data';
import type { Client } from '@/lib/mocks/mock-data';
import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

export function ClientsModule() {
    const [clients, setClients] = useState(() => [...mockClients]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('action') === 'create-client') {
            setIsCreateOpen(true);
            window.history.replaceState({}, '', '/dashboard/clients');
        }
    }, []);

    const columns: Column<Client>[] = [
        { key: 'name', header: 'Nome' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Telefone' },
        { key: 'document', header: 'Documento' },
        { key: 'city', header: 'Cidade' },
        { key: 'state', header: 'Estado' },
    ];

    const cityOptions = useMemo(
        () =>
            Array.from(new Set(clients.map((client) => client.city)))
                .sort((a, b) => a.localeCompare(b, 'pt-BR'))
                .map((value) => ({ value, label: value })),
        [clients],
    );

    const stateOptions = useMemo(
        () =>
            Array.from(new Set(clients.map((client) => client.state)))
                .sort((a, b) => a.localeCompare(b, 'pt-BR'))
                .map((value) => ({ value, label: value })),
        [clients],
    );

    const filterFields = [
        { key: 'name', label: 'Nome', type: 'text' as const },
        { key: 'email', label: 'Email', type: 'text' as const },
        {
            key: 'city',
            label: 'Cidade',
            type: 'select' as const,
            options: cityOptions,
        },
        {
            key: 'state',
            label: 'Estado',
            type: 'select' as const,
            options: stateOptions,
        },
    ];

    const handleCreate = (data: Client) => {
        const newClient: Client = {
            id: crypto.randomUUID(),
            name: String(data.name || '').trim(),
            email: String(data.email || '').trim(),
            phone: String(data.phone || '').trim(),
            document: String(data.document || '').trim(),
            city: String(data.city || '').trim(),
            state: String(data.state || '').trim(),
            address: String(data.address || '').trim(),
            createdAt: new Date().toISOString().slice(0, 10),
        };

        if (!newClient.name) {
            toast.error('Informe o nome do cliente');
            return;
        }

        setClients((previous) => [newClient, ...previous]);
        toast.success('Cliente cadastrado com sucesso');
    };

    return (
        <GenericTable
            data={clients}
            columns={columns}
            title="Clientes"
            filterFields={filterFields}
            onCreate={handleCreate}
            isCreateOpen={isCreateOpen}
            onCreateOpenChange={setIsCreateOpen}
            createFields={[
                {
                    name: 'name',
                    label: 'Nome',
                    type: 'text',
                    required: true,
                    placeholder: 'Nome completo',
                },
                {
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    placeholder: 'cliente@empresa.com',
                },
                {
                    name: 'phone',
                    label: 'Telefone',
                    type: 'text',
                    placeholder: '(00) 00000-0000',
                },
                {
                    name: 'document',
                    label: 'Documento',
                    type: 'text',
                    placeholder: 'CPF/CNPJ',
                },
                {
                    name: 'city',
                    label: 'Cidade',
                    type: 'select',
                    options: cityOptions,
                },
                {
                    name: 'state',
                    label: 'Estado',
                    type: 'select',
                    options: stateOptions,
                },
                {
                    name: 'address',
                    label: 'Endereço',
                    type: 'text',
                    placeholder: 'Rua, número e complemento',
                },
            ]}
        />
    );
}
