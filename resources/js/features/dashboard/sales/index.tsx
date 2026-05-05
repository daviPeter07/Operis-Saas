import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import { SalesDialog } from '@/components/sales-dialog/sales-dialog';
import { PAYMENT_METHOD_OPTIONS } from '@/constants/payment-methods';
import { STATUS_OPTIONS } from '@/constants/status';
import { useCustomers } from '@/hooks/use-customers';
import { useProducts } from '@/hooks/use-products';
import { useCreateSale, useDeleteSale, useSales } from '@/hooks/use-sales';
import {
    formatCurrencyBR,
    formatDateBR,
    translatePaymentMethod,
} from '@/lib/format';
import type { UiCustomer, UiProduct } from '@/types/dashboard-entities';
import type { SalesRecord } from '@/types/sales-dialog';
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
    const deleteSale = useDeleteSale();
    const [dialogCustomers, setDialogCustomers] = useState<UiCustomer[]>([]);
    const [dialogProducts, setDialogProducts] = useState<UiProduct[]>([]);

    const mappedCustomers = useMemo<UiCustomer[]>(
        () =>
            customers.map((customer) => ({
                id: String(customer.id),
                name: customer.name,
                email: customer.email ?? '',
                phone: customer.phone ?? '',
                document: customer.document ?? '',
                city: '',
                state: '',
                address: '',
                createdAt: new Date().toISOString().slice(0, 10),
            })),
        [customers],
    );

    const mappedProducts = useMemo<UiProduct[]>(
        () =>
            products.map((product) => ({
                id: String(product.id),
                name: product.name,
                sku: product.sku,
                barcode: product.barcode ?? undefined,
                category: String(product.category_id ?? ''),
                brand: String(product.brand_id ?? ''),
                price: Number(product.sale_price ?? 0),
                cost: Number(product.cost ?? 0),
                stock: Number(product.stock ?? 0),
                minStock: Number(product.min_stock ?? 0),
                createdAt: new Date().toISOString().slice(0, 10),
            })),
        [products],
    );

    const salesDialogCustomers = useMemo(
        () => [...dialogCustomers, ...mappedCustomers],
        [dialogCustomers, mappedCustomers],
    );

    const salesDialogProducts = useMemo(
        () => [...dialogProducts, ...mappedProducts],
        [dialogProducts, mappedProducts],
    );

    const customerNameById = useMemo(
        () =>
            new Map(customers.map((customer) => [customer.id, customer.name])),
        [customers],
    );

    const rows: SaleRow[] = sales
        .filter((sale) => sale.status !== 'cancelled')
        .map((sale) => ({
            id: String(sale.id),
            customer_id: sale.customer_id,
            clientName:
                customerNameById.get(sale.customer_id) ||
                `#${sale.customer_id}`,
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

    const handleCreateFromSalesDialog = async (sale: SalesRecord) => {
        const customerId = Number(sale.clientId);

        const items = sale.lineItems
            .map((item) => ({
                product_id: Number(item.productId),
                quantity: Number(item.quantity),
                unit_price: Number(item.unitPrice),
            }))
            .filter(
                (item) =>
                    Number.isFinite(item.product_id) &&
                    item.product_id > 0 &&
                    Number.isFinite(item.quantity) &&
                    item.quantity > 0 &&
                    Number.isFinite(item.unit_price) &&
                    item.unit_price >= 0,
            );

        if (!Number.isFinite(customerId) || customerId <= 0) {
            throw new Error('Selecione um cliente válido para continuar.');
        }

        if (items.length === 0) {
            throw new Error('Adicione ao menos um item válido na venda.');
        }

        const paymentMethod: 'cash' | 'pix' | 'card' | 'installment' =
            sale.paymentMethod === 'money'
                ? 'cash'
                : sale.paymentMethod === 'other'
                  ? 'installment'
                  : sale.paymentMethod;

        await createSale.mutateAsync({
            customer_id: customerId,
            date: sale.createdAt || new Date().toISOString().slice(0, 10),
            payment_method: paymentMethod,
            status: 'pending',
            items,
        });

        toast.success('Venda criada com sucesso.');
    };

    const handleCreateClient = (client: UiCustomer): UiCustomer => {
        setDialogCustomers((previous) => [client, ...previous]);

        return client;
    };

    const handleCreateProduct = (product: UiProduct): UiProduct => {
        setDialogProducts((previous) => [product, ...previous]);

        return product;
    };

    return (
        <div className="space-y-5">
            <SalesHeader metrics={metrics} />

            <GenericTable
                data={rows}
                columns={columns}
                title="Vendas"
                filterFields={filterFields}
                onDelete={async (row) => {
                    await deleteSale.mutateAsync(Number(row.id));
                }}
                createDialog={({ open, onOpenChange }) => (
                    <SalesDialog
                        open={open}
                        onOpenChange={onOpenChange}
                        onSubmit={(sale) => {
                            void handleCreateFromSalesDialog(sale)
                                .then(() => {
                                    onOpenChange(false);
                                })
                                .catch((error: unknown) => {
                                    const message =
                                        error instanceof Error && error.message
                                            ? error.message
                                            : 'Erro ao criar a venda.';

                                    toast.error(message);
                                });
                        }}
                        clients={salesDialogCustomers}
                        products={salesDialogProducts}
                        onCreateClient={handleCreateClient}
                        onCreateProduct={handleCreateProduct}
                    />
                )}
            />
        </div>
    );
}
