import { useMemo, useState } from 'react';
import {
    formatCurrencyBR,
    formatDateBR,
    formatQuantityWithUnit,
    translatePaymentMethod,
    translateStatus,
} from '@/lib/format';
import { mockClients, mockProducts, mockSales } from '@/lib/mocks/mock-data';
import type { Client, Product, Sale } from '@/lib/mocks/mock-data';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { SalesHeader } from './sales-header';
import type { SalesRecord } from '@/types/sales-dialog';
import { SalesDialog } from './sales-dialog';

export function SalesModule() {
    const [sales, setSales] = useState<SalesRecord[]>(() =>
        mockSales.map((sale) => ({
            ...sale,
            lineItems: [],
        })),
    );
    const [clients, setClients] = useState<Client[]>(() => [...mockClients]);
    const [products, setProducts] = useState<Product[]>(() => [
        ...mockProducts,
    ]);

    const columns: Column<Sale>[] = [
        { key: 'clientName', header: 'Cliente' },
        {
            key: 'total',
            header: 'Total',
            render: (val: unknown) => formatCurrencyBR(Number(val)),
        },
        {
            key: 'status',
            header: 'Status',
            render: (val: unknown) => translateStatus(String(val)),
        },
        {
            key: 'paymentMethod',
            header: 'Método',
            render: (val: unknown) => translatePaymentMethod(String(val)),
        },
        {
            key: 'items',
            header: 'Itens',
            render: (val: unknown) => formatQuantityWithUnit(Number(val)),
        },
        {
            key: 'createdAt',
            header: 'Data',
            render: (val: unknown) => formatDateBR(String(val)),
        },
    ];

    const metrics = useMemo(() => {
        const salesCount = sales.length;
        const salesTotal = sales.reduce((sum, sale) => sum + sale.total, 0);
        const receivable = sales
            .filter((sale) => sale.status === 'pending')
            .reduce((sum, sale) => sum + sale.total, 0);
        const profit = sales.reduce<number>((sum, sale) => {
            if (sale.lineItems.length > 0) {
                return (
                    sum +
                    sale.lineItems.reduce<number>(
                        (itemSum, item) =>
                            itemSum +
                            (item.unitPrice - item.unitCost) * item.quantity,
                        0,
                    )
                );
            }

            return sum + sale.total * 0.32;
        }, 0);

        return {
            salesCount,
            salesTotal,
            profit,
            receivable,
        };
    }, [sales]);

    const filterFields = [
        { key: 'clientName', label: 'Cliente', type: 'text' as const },
        {
            key: 'status',
            label: 'Status',
            type: 'select' as const,
            options: [
                { value: 'pending', label: 'Pendente' },
                { value: 'completed', label: 'Concluído' },
                { value: 'cancelled', label: 'Cancelado' },
            ],
        },
        {
            key: 'paymentMethod',
            label: 'Método de Pagamento',
            type: 'select' as const,
            options: [
                { value: 'money', label: 'Dinheiro' },
                { value: 'credit', label: 'Crédito' },
                { value: 'debit', label: 'Débito' },
                { value: 'pix', label: 'PIX' },
                { value: 'installment', label: 'Parcelado' },
            ],
        },
    ];

    const handleCreate = (data: SalesRecord) => {
        const status = ['pending', 'completed', 'cancelled'].includes(
            String(data.status),
        )
            ? (String(data.status) as Sale['status'])
            : 'pending';

        const paymentMethod = [
            'money',
            'credit',
            'debit',
            'pix',
            'installment',
        ].includes(String(data.paymentMethod))
            ? (String(data.paymentMethod) as Sale['paymentMethod'])
            : 'pix';

        const newSale: Sale = {
            id: crypto.randomUUID(),
            clientId: data.clientId,
            clientName: String(data.clientName || ''),
            total: Number(data.total || 0),
            status,
            paymentMethod,
            items: Number(data.items || 1),
            createdAt:
                String(data.createdAt || '') ||
                new Date().toISOString().slice(0, 10),
        };

        setSales((previous) => [
            {
                ...newSale,
                notes: data.notes,
                lineItems: data.lineItems,
            },
            ...previous,
        ]);
    };

    const handleCreateClient = (client: Client): Client => {
        setClients((previous) => [client, ...previous]);

        return client;
    };

    const handleCreateProduct = (product: Product): Product => {
        setProducts((previous) => [product, ...previous]);

        return product;
    };

    return (
        <div className="space-y-5">
            <SalesHeader metrics={metrics} />

            <GenericTable
                data={sales}
                columns={columns}
                title="Vendas"
                filterFields={filterFields}
                onCreate={handleCreate}
                createDialog={({ open, onOpenChange, onSubmit }) => (
                    <SalesDialog
                        open={open}
                        onOpenChange={onOpenChange}
                        onSubmit={onSubmit}
                        clients={clients}
                        products={products}
                        onCreateClient={handleCreateClient}
                        onCreateProduct={handleCreateProduct}
                    />
                )}
            />
        </div>
    );
}


