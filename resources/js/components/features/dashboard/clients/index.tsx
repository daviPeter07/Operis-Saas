import { ClientsTable } from './table';
import { mockClients } from '@/lib/mocks/mock-data';

export function ClientsModule() {
    return <ClientsTable data={mockClients} />;
}
