import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import { PAYMENT_METHOD_OPTIONS } from '@/constants/payment-methods';
import { STATUS_OPTIONS } from '@/constants/status';
import { useProducts } from '@/hooks/use-products';
import {
    useCreatePurchase,
    useDeletePurchase,
    usePurchases,
} from '@/hooks/use-purchases';
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
    const { data: products = [] } = useProducts();
    const createPurchase = useCreatePurchase();
    const deletePurchase = useDeletePurchase();

    const suppliersById = new Map(
        suppliers.map((supplier) => [supplier.id, supplier.name]),
    );

    const rows: PurchaseRow[] = purchases
        .filter((purchase) => purchase.status !== 'cancelled')
        .map((purchase) => ({
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

    const createFields = [
        {
            name: 'supplier_id',
            label: 'Fornecedor',
            type: 'select' as const,
            options: suppliers.map((supplier) => ({
                value: String(supplier.id),
                label: supplier.name,
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
            name: 'unit_cost',
            label: 'Custo unitário',
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
        {
            name: 'due_date',
            label: 'Vencimento',
            type: 'date' as const,
        },
    ];

    const handleCreate = async (data: Record<string, unknown>) => {
        const supplierId = Number(data.supplier_id || 0);
        const productId = Number(data.product_id || 0);
        const quantity = Number(data.quantity || 0);
        const unitCost = Number(data.unit_cost || 0);
        const paymentMethod = String(data.payment_method || 'pix') as
            | 'cash'
            | 'pix'
            | 'card'
            | 'installment';
        const date = String(data.date || '').trim();
        const dueDate = String(data.due_date || '').trim();

        if (!supplierId || !productId || quantity <= 0 || unitCost < 0) {
            throw new Error('Preencha os dados obrigatórios da compra.');
        }

        await createPurchase.mutateAsync({
            supplier_id: supplierId,
            date: date || new Date().toISOString().slice(0, 10),
            due_date: dueDate || undefined,
            payment_method: paymentMethod,
            status: 'pending',
            items: [
                {
                    product_id: productId,
                    quantity,
                    unit_cost: unitCost,
                },
            ],
        });

        toast.success('Compra criada com sucesso.');
    };

    return (
        <GenericTable
            data={rows}
            columns={columns}
            title="Compras"
            filterFields={filterFields}
            onCreate={handleCreate as (data: PurchaseRow) => Promise<void>}
            onDelete={async (row) => {
                await deletePurchase.mutateAsync(Number(row.id));
            }}
            createFields={createFields}
        />
    );
}
