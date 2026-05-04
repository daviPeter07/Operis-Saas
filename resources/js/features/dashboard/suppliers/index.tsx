import { useMemo, useState } from 'react';
import { PersonTypeBadge } from '@/components/common/person-type-badge';
import { StateCityFilter } from '@/components/filters/state-city-filter';
import { STATE_OPTIONS } from '@/constants/location-source';
import { mockSuppliers } from '@/lib/mocks/mock-data';
import type { Supplier } from '@/lib/mocks/mock-data';
import { inferPersonType } from '@/utils/clients';
import { createSupplierRecord } from '@/utils/suppliers';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { SupplierCreateDialog } from './supplier-create-dialog';

export function SuppliersModule() {
    const [suppliers, setSuppliers] = useState(() => [...mockSuppliers]);
    const [stateFilter, setStateFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');

    const columns: Column<Supplier>[] = [
        { key: 'name', header: 'Nome' },
        {
            key: 'personType',
            header: 'Tipo',
            render: (_value: unknown, row: Supplier) => (
                <PersonTypeBadge personType={inferPersonType(row.document)} />
            ),
        },
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
            options: [...STATE_OPTIONS],
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
        const newSupplier = createSupplierRecord(data);

        if (!newSupplier.name) {
            throw new Error('Informe o nome do fornecedor');
        }

        setSuppliers((previous) => [newSupplier, ...previous]);
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
