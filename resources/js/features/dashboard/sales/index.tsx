import { useMemo } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import { PAYMENT_METHOD_OPTIONS } from '@/constants/payment-methods';
import { STATUS_OPTIONS } from '@/constants/status';
import { useCustomers } from '@/hooks/use-customers';
import { useProducts } from '@/hooks/use-products';
import { useCreateSale, useSales } from '@/hooks/use-sales';
import {
    formatCurrencyBR,
    formatDateBR,
    translatePaymentMethod,
} from '@/lib/format';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { SalesHeader } from './sales-header';

type SaleRow = {
    id: string;
    customer_id: number;
    clientName: string;
    total: number;
    status: string;
    payment_method: string;
    date: string;
};

export function SalesModule() {
    const { data: sales = [] } = useSales();
    const { data: customers = [] } = useCustomers();
    const { data: products = [] } = useProducts();
    const createSale = useCreateSale();

    const customerNameById = useMemo(
        () => new Map(customers.map((customer) => [customer.id, customer.name])),
        [customers],
    );

    const rows: SaleRow[] = sales.map((sale) => ({
        id: String(sale.id),
        customer_id: sale.customer_id,
        clientName: customerNameById.get(sale.customer_id) || `#${sale.customer_id}`,
        total: sale.total,
        status: sale.status,
        payment_method: sale.payment_method,
        date: sale.date,
    }));

    const columns: Column<SaleRow>[] = [
        { key: 'clientName', header: 'Cliente' },
        {
            key: 'total',
            header: 'Total',
            render: (val: unknown) => formatCurrencyBR(Number(val)),
        },
        {
            key: 'status',
            header: 'Status',
            render: (val: unknown) => <StatusBadge status={String(val)} />,
        },
        {
            key: 'payment_method',
            header: 'Método',
            render: (val: unknown) => translatePaymentMethod(String(val)),
        },
        {
            key: 'date',
            header: 'Data',
            render: (val: unknown) => formatDateBR(String(val)),
        },
    ];

    const metrics = useMemo(() => {
        const salesCount = rows.length;
        const salesTotal = rows.reduce((sum, sale) => sum + sale.total, 0);
        const receivable = rows
            .filter((sale) => sale.status === 'pending')
            .reduce((sum, sale) => sum + sale.total, 0);

        return {
            salesCount,
            salesTotal,
            profit: 0,
            receivable,
        };
    }, [rows]);

    const filterFields = [
        { key: 'clientName', label: 'Cliente', type: 'text' as const },
        {
            key: 'status',
            label: 'Status',
            type: 'select' as const,
            options: [...STATUS_OPTIONS],
        },
        {
            key: 'payment_method',
            label: 'Método de Pagamento',
            type: 'select' as const,
            options: [...PAYMENT_METHOD_OPTIONS],
        },
    ];

    const createFields = [
        {
            name: 'customer_id',
            label: 'Cliente',
            type: 'select' as const,
            options: customers.map((customer) => ({
                value: String(customer.id),
                label: customer.name,
            })),
            required: true,
        },
        {
            name: 'product_id',
            label: 'Produto',
            type: 'select' as const,
            options: products.map((product) => ({
                value: String(product.id),
                label: product.name,
            })),
            required: true,
        },
        {
            name: 'quantity',
            label: 'Quantidade',
            type: 'number' as const,
            required: true,
        },
        {
            name: 'unit_price',
            label: 'Preço unitário',
            type: 'number' as const,
            required: true,
        },
        {
            name: 'payment_method',
            label: 'Método de pagamento',
            type: 'select' as const,
            options: [
                { value: 'cash', label: 'Dinheiro' },
                { value: 'pix', label: 'PIX' },
                { value: 'card', label: 'Cartão' },
                { value: 'installment', label: 'Parcelado' },
            ],
            required: true,
        },
        {
            name: 'date',
            label: 'Data',
            type: 'date' as const,
            required: true,
        },
    ];

    const handleCreate = async (data: Record<string, unknown>) => {
        const customerId = Number(data.customer_id || 0);
        const productId = Number(data.product_id || 0);
        const quantity = Number(data.quantity || 0);
        const unitPrice = Number(data.unit_price || 0);
        const paymentMethod = String(data.payment_method || 'pix') as
            | 'cash'
            | 'pix'
            | 'card'
            | 'installment';
        const date = String(data.date || '').trim();

        if (!customerId || !productId || quantity <= 0 || unitPrice < 0) {
            throw new Error('Preencha os dados obrigatórios da venda.');
        }

        await createSale.mutateAsync({
            customer_id: customerId,
            date: date || new Date().toISOString().slice(0, 10),
            payment_method: paymentMethod,
            status: 'pending',
            items: [
                {
                    product_id: productId,
                    quantity,
                    unit_price: unitPrice,
                },
            ],
        });

        toast.success('Venda criada com sucesso.');
    };

    return (
        <div className="space-y-5">
            <SalesHeader metrics={metrics} />

            <GenericTable
                data={rows}
                columns={columns}
                title="Vendas"
                filterFields={filterFields}
                onCreate={handleCreate as (data: SaleRow) => Promise<void>}
                createFields={createFields}
            />
        </div>
    );
}
