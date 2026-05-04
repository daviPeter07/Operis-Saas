import { useEffect, useMemo, useState } from 'react';
import { PersonTypeBadge } from '@/components/common/person-type-badge';
import { StateCityFilter } from '@/components/filters/state-city-filter';
import { mockClients } from '@/lib/mocks/mock-data';
import type { Client } from '@/lib/mocks/mock-data';
import type { ClientCreateDialogPayload } from '@/types/dashboard-forms';
import { createClientRecord, inferClientPersonType } from '@/utils/clients';
import { formatDocumentInput, formatPhoneInput } from '@/utils/form-fields';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { ClientCreateDialog } from './client-create-dialog';

type ClientRow = Client & {
    personType: 'pf' | 'pj';
};

export function ClientsModule() {
    const [clients, setClients] = useState<ClientRow[]>(() =>
        mockClients.map((client) => ({
            ...client,
            personType: inferClientPersonType(client.document),
        })),
    );
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

    const handleCreate = (data: ClientCreateDialogPayload) => {
        const newClient = createClientRecord(data);

        if (!newClient.name) {
            throw new Error('Informe o nome do cliente');
        }

        setClients((previous) => [
            {
                ...newClient,
                personType: data.personType,
            },
            ...previous,
        ]);
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
                createDialog={({ open, onOpenChange, onSubmit }) => (
                    <ClientCreateDialog
                        open={open}
                        onOpenChange={onOpenChange}
                        onSubmit={onSubmit}
                    />
                )}
            />
        </div>
    );
}
