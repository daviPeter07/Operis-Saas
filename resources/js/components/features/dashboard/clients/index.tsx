import { mockClients } from '@/lib/mocks/mock-data';
import type { Client } from '@/lib/mocks/mock-data';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

export function ClientsModule() {
    const columns: Column<Client>[] = [
        { key: 'name', header: 'Nome' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Telefone' },
        { key: 'document', header: 'Documento' },
        { key: 'city', header: 'Cidade' },
        { key: 'state', header: 'Estado' },
    ];

    const filterFields = [
        { key: 'name', label: 'Nome', type: 'text' as const },
        { key: 'email', label: 'Email', type: 'text' as const },
        {
            key: 'city',
            label: 'Cidade',
            type: 'select' as const,
            options: [...new Set(mockClients.map((c) => c.city))]
                .sort()
                .map((v) => ({ value: v, label: v })),
        },
        {
            key: 'state',
            label: 'Estado',
            type: 'select' as const,
            options: [...new Set(mockClients.map((c) => c.state))]
                .sort()
                .map((v) => ({ value: v, label: v })),
        },
    ];

    return (
        <GenericTable
            data={mockClients}
            columns={columns}
            title="Clientes"
            filterFields={filterFields}
            onCreate={() => {}}
        />
    );
}
