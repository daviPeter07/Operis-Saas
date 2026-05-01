import { mockSuppliers } from '@/lib/mocks/mock-data';
import { StateCityFilter } from '@/components/filters/state-city-filter';
import { STATE_OPTIONS } from '@/constants/location-source';
import type { Supplier } from '@/lib/mocks/mock-data';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { SupplierCreateDialog } from './supplier-create-dialog';

export function SuppliersModule() {
    const [suppliers, setSuppliers] = useState(() => [...mockSuppliers]);
    const [stateFilter, setStateFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');

    const columns: Column<Supplier>[] = [
        { key: 'name', header: 'Nome' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Telefone' },
        { key: 'document', header: 'Documento' },
        { key: 'city', header: 'Cidade' },
        { key: 'state', header: 'Estado' },
    ];

    const cityOptions = useMemo(
        () =>
            Array.from(new Set(suppliers.map((supplier) => supplier.city))).map(
                (value) => ({ value, label: value }),
            ),
        [suppliers],
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
            options: STATE_OPTIONS,
        },
    ];

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter((supplier) => {
            if (stateFilter && supplier.state !== stateFilter) {
                return false;
            }

            if (cityFilter && supplier.city !== cityFilter) {
                return false;
            }

            return true;
        });
    }, [cityFilter, stateFilter, suppliers]);

    const handleCreate = (data: Supplier) => {
        const newSupplier: Supplier = {
            id: crypto.randomUUID(),
            name: String(data.name || '').trim(),
            email: String(data.email || '').trim(),
            phone: String(data.phone || '').trim(),
            document: String(data.document || '').trim(),
            city: String(data.city || '').trim(),
            state: String(data.state || '').trim(),
            address: [
                String(data.street || '').trim(),
                String(data.number || '').trim(),
                String(data.neighborhood || '').trim(),
                String(data.zipCode || '').trim(),
            ]
                .filter(Boolean)
                .join(', '),
            createdAt: new Date().toISOString().slice(0, 10),
        };

        if (!newSupplier.name) {
            toast.error('Informe o nome do fornecedor');
            return;
        }

        setSuppliers((previous) => [newSupplier, ...previous]);
        toast.success('Fornecedor cadastrado com sucesso');
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
                data={filteredSuppliers}
                columns={columns}
                title="Fornecedores"
                filterFields={filterFields}
                onCreate={handleCreate}
                createDialog={({ open, onOpenChange, onSubmit }) => (
                    <SupplierCreateDialog
                        open={open}
                        onOpenChange={onOpenChange}
                        onSubmit={onSubmit}
                    />
                )}
            />
        </div>
    );
}
