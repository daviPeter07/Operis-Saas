import { useMemo } from 'react';
import { StatusBadge } from '@/components/common/status-badge';
import { PAYMENT_METHOD_OPTIONS } from '@/constants/payment-methods';
import { STATUS_OPTIONS } from '@/constants/status';
import { useCustomers } from '@/hooks/use-customers';
import { useSales } from '@/hooks/use-sales';
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

    return (
        <div className="space-y-5">
            <SalesHeader metrics={metrics} />

            <GenericTable
                data={rows}
                columns={columns}
                title="Vendas"
                filterFields={filterFields}
            />
        </div>
    );
}
