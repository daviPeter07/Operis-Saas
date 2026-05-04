import { StatusBadge } from '@/components/common/status-badge';
import { PAYMENT_METHOD_OPTIONS } from '@/constants/payment-methods';
import { STATUS_OPTIONS } from '@/constants/status';
import { usePurchases } from '@/hooks/use-purchases';
import { useSuppliers } from '@/hooks/use-suppliers';
import {
    formatDateBR,
    formatCurrencyBR,
    translatePaymentMethod,
} from '@/lib/format';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

type PurchaseRow = {
    id: string;
    supplier_id: number;
    supplierName: string;
    total: number;
    status: string;
    payment_method: string;
    due_date: string;
    date: string;
};

export function PurchasesModule() {
    const { data: purchases = [] } = usePurchases();
    const { data: suppliers = [] } = useSuppliers();

    const suppliersById = new Map(
        suppliers.map((supplier) => [supplier.id, supplier.name]),
    );

    const rows: PurchaseRow[] = purchases.map((purchase) => ({
        id: String(purchase.id),
        supplier_id: purchase.supplier_id,
        supplierName:
            suppliersById.get(purchase.supplier_id) ||
            `#${purchase.supplier_id}`,
        total: purchase.total,
        status: purchase.status,
        payment_method: purchase.payment_method,
        due_date: purchase.due_date,
        date: purchase.date,
    }));

    const columns: Column<PurchaseRow>[] = [
        { key: 'supplierName', header: 'Fornecedor' },
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
        {
            key: 'due_date',
            header: 'Vencimento',
            render: (val: unknown) => formatDateBR(String(val)),
        },
    ];

    const filterFields = [
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
        <GenericTable
            data={rows}
            columns={columns}
            title="Compras"
            filterFields={filterFields}
        />
    );
}
