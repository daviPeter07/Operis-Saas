import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { StateCityFilter } from '@/components/filters/state-city-filter';
import { Badge } from '@/components/ui/badge';
import { STATE_OPTIONS } from '@/constants/location-source';
import { toast } from 'sonner';
import { mockClients } from '@/lib/mocks/mock-data';
import type { Client } from '@/lib/mocks/mock-data';
import { formatDocumentInput, formatPhoneInput } from '@/utils/form-fields';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

export function ClientsModule() {
    const [clients, setClients] = useState(() => [...mockClients]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [stateFilter, setStateFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('action') === 'create-client') {
            setIsCreateOpen(true);
            window.history.replaceState({}, '', '/dashboard/clients');
        }
    }, []);

    const columns: Column<Client>[] = [
        {
            key: 'name',
            header: 'Nome',
            render: (_value: unknown, row: Client) => {
                const numeric = row.document.replace(/\D/g, '');
                const personType = numeric.length <= 11 ? 'PF' : 'PJ';

                return (
                    <div className="flex items-center gap-2">
                        <span>{row.name}</span>
                        <Badge variant="secondary">{personType}</Badge>
                    </div>
                );
            },
        },
        { key: 'email', header: 'Email' },
        {
            key: 'phone',
            header: 'Telefone',
            render: (value: unknown) => formatPhoneInput(String(value || '')),
        },
        {
            key: 'document',
            header: 'Documento',
            render: (value: unknown) =>
                formatDocumentInput(String(value || '')),
        },
        { key: 'city', header: 'Cidade' },
        { key: 'state', header: 'Estado' },
    ];

    const filterFields = [
        { key: 'name', label: 'Nome', type: 'text' as const },
        { key: 'email', label: 'Email', type: 'text' as const },
    ];

    const cityOptions = useMemo(
        () =>
            Array.from(new Set(clients.map((client) => client.city)))
                .sort((a, b) => a.localeCompare(b, 'pt-BR'))
                .map((value) => ({ value, label: value })),
        [clients],
    );

    const filteredClients = useMemo(() => {
        return clients.filter((client) => {
            if (stateFilter && client.state !== stateFilter) {
                return false;
            }

            if (cityFilter && client.city !== cityFilter) {
                return false;
            }

            return true;
        });
    }, [cityFilter, clients, stateFilter]);

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
        <div className="space-y-4">
            <StateCityFilter
                stateValue={stateFilter}
                cityValue={cityFilter}
                onStateChange={setStateFilter}
                onCityChange={setCityFilter}
            />

            <GenericTable
                data={filteredClients}
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
                    mask: 'phone',
                },
                {
                    name: 'document',
                    label: 'Documento',
                    type: 'text',
                    placeholder: 'CPF/CNPJ',
                    mask: 'document',
                },
                {
                    name: 'city',
                    label: 'Cidade',
                    type: 'select',
                    searchable: true,
                    options: cityOptions,
                },
                {
                    name: 'state',
                    label: 'Estado',
                    type: 'select',
                    options: STATE_OPTIONS,
                },
                {
                    name: 'address',
                    label: 'Endereço',
                    type: 'text',
                    placeholder: 'Rua, número e complemento',
                },
                ]}
            />
        </div>
    );
}
