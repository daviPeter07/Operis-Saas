import { mockSuppliers } from '@/lib/mocks/mock-data';
import type { Supplier } from '@/lib/mocks/mock-data';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

export function SuppliersModule() {
    const [suppliers, setSuppliers] = useState(() => [...mockSuppliers]);

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
            Array.from(new Set(suppliers.map((supplier) => supplier.city)))
                .sort((a, b) => a.localeCompare(b, 'pt-BR'))
                .map((value) => ({ value, label: value })),
        [suppliers],
    );

    const stateOptions = useMemo(
        () =>
            Array.from(new Set(suppliers.map((supplier) => supplier.state)))
                .sort((a, b) => a.localeCompare(b, 'pt-BR'))
                .map((value) => ({ value, label: value })),
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
            options: stateOptions,
        },
    ];

    const handleCreate = (data: Supplier) => {
        const newSupplier: Supplier = {
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

        if (!newSupplier.name) {
            toast.error('Informe o nome do fornecedor');
            return;
        }

        setSuppliers((previous) => [newSupplier, ...previous]);
        toast.success('Fornecedor cadastrado com sucesso');
    };

    return (
        <GenericTable
            data={suppliers}
            columns={columns}
            title="Fornecedores"
            filterFields={filterFields}
            onCreate={handleCreate}
            createFields={[
                {
                    name: 'name',
                    label: 'Nome',
                    type: 'text',
                    required: true,
                    placeholder: 'Razão social ou nome fantasia',
                },
                {
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    placeholder: 'contato@fornecedor.com',
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
                    placeholder: 'CNPJ/CPF',
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
