import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import { PAYMENT_METHOD_OPTIONS } from '@/constants/payment-methods';
import { STATUS_OPTIONS } from '@/constants/status';
import { SalesDialog } from '@/components/sales-dialog/sales-dialog';
import { useCustomers } from '@/hooks/use-customers';
import { useProducts } from '@/hooks/use-products';
import {
    useCreateSale,
    useDeleteSale,
    type SaleMutationInput,
    useUpdateSale,
    useSales,
} from '@/hooks/use-sales';
import { saleService } from '@/services/sales';
import type { Column } from '../generic-table';
import { GenericTable } from '../generic-table';
import {
    formatCurrencyBR,
    formatDateBR,
    translatePaymentMethod,
} from '@/lib/format';
import type {
    UiCustomer,
    UiPaymentMethod,
    UiProduct,
} from '@/types/dashboard-entities';
import { SalesRecord as DialogSalesRecord } from '@/types/sales-dialog';
import { SalesHeader } from './sales-header';

type SaleRow = {
    id: string;
    customer_id: number;
    clientName: string;
    total: number;
    payment_method: string;
    status: string;
    date: string;
};

type SaleMutationPayload = SaleMutationInput;

export function SalesModule() {
    const [isCreateOpen, setIsCreateOpen] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('action') === 'create-sale';
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('action') === 'create-sale') {
            window.history.replaceState({}, '', '/dashboard/sales');
        }
    }, []);
    const { data: sales = [] } = useSales();
    const { data: customers = [] } = useCustomers();
    const { data: products = [] } = useProducts();
    const createSale = useCreateSale();
    const deleteSale = useDeleteSale();
    const updateSale = useUpdateSale();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editSale, setEditSale] = useState<DialogSalesRecord | null>(null);
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

    const productById = useMemo(
        () =>
            new Map(
                salesDialogProducts.map((product) => [product.id, product]),
            ),
        [salesDialogProducts],
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

    const handleCreateFromSalesDialog = async (sale: DialogSalesRecord) => {
        const customerId = Number(sale.clientId);

        const items = sale.lineItems
            .map((item: DialogSalesRecord['lineItems'][number]) => ({
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

        const paymentMethod =
            sale.paymentMethod === 'money'
                ? 'cash'
                : sale.paymentMethod === 'other'
                  ? 'installment'
                  : sale.paymentMethod;

        const payload: SaleMutationPayload = {
            customer_id: customerId,
            date: sale.createdAt || new Date().toISOString().slice(0, 10),
            payment_method: paymentMethod as
                | 'cash'
                | 'pix'
                | 'card'
                | 'installment',
            status: 'pending',
            items,
        };

        await createSale.mutateAsync(payload);

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
                isCreateOpen={isCreateOpen}
                onCreateOpenChange={setIsCreateOpen}
                onDelete={async (row) => {
                    await deleteSale.mutateAsync(Number(row.id));
                }}
                onEdit={async (row) => {
                    try {
                        const full = await saleService.get(Number(row.id));
                        const mappedPaymentMethod: UiPaymentMethod =
                            full.payment_method === 'cash'
                                ? 'money'
                                : full.payment_method === 'installment'
                                  ? 'other'
                                  : full.payment_method === 'pix'
                                    ? 'pix'
                                    : 'card';

                        const mappedSale: DialogSalesRecord = {
                            id: String(full.id),
                            clientId: String(full.customer_id),
                            clientName: '',
                            createdAt: full.date,
                            lineItems: (full.items ?? []).map((item) => {
                                const product = productById.get(
                                    String(item.product_id),
                                );

                                return {
                                    id: crypto.randomUUID(),
                                    productId: String(item.product_id),
                                    productName: product?.name ?? `#${item.product_id}`,
                                    sku: product?.sku ?? '',
                                    quantity: item.quantity,
                                    unitPrice: item.unit_price,
                                    unitCost: product?.cost ?? 0,
                                    subtotal: item.subtotal,
                                };
                            }),
                            paymentMethod: mappedPaymentMethod,
                            total: full.total,
                            status:
                                full.status === 'completed'
                                    ? 'completed'
                                    : full.status === 'cancelled'
                                      ? 'cancelled'
                                      : 'pending',
                        };
                        setEditSale(mappedSale);
                        setIsEditOpen(true);
                    } catch (e) {
                        toast.error('Erro ao carregar a venda para edição.');
                    }
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
            {/* Edit Sale Dialog */}
            {editSale && (
                <SalesDialog
                    open={isEditOpen}
                    onOpenChange={(open) => {
                        setIsEditOpen(open);
                        if (!open) setEditSale(null);
                    }}
                    onSubmit={async (sale) => {
                        const customerId = Number(sale.clientId);
                        const items = sale.lineItems
                            .map(
                                (
                                    item: DialogSalesRecord['lineItems'][number],
                                ) => ({
                                    product_id: Number(item.productId),
                                    quantity: Number(item.quantity),
                                    unit_price: Number(item.unitPrice),
                                    subtotal: Number(
                                        (
                                            Number(item.unitPrice) *
                                            Number(item.quantity)
                                        ).toFixed(2),
                                    ),
                                }),
                            )
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
                            toast.error(
                                'Selecione um cliente válido para continuar.',
                            );
                            return;
                        }
                        if (items.length === 0) {
                            toast.error(
                                'Adicione ao menos um item válido na venda.',
                            );
                            return;
                        }
                        const paymentMethod =
                            sale.paymentMethod === 'money'
                                ? 'cash'
                                : sale.paymentMethod === 'other'
                                  ? 'installment'
                                  : sale.paymentMethod;
                        try {
                            const payload: SaleMutationPayload = {
                                customer_id: customerId,
                                date:
                                    sale.createdAt ||
                                    new Date().toISOString().slice(0, 10),
                                payment_method: paymentMethod as
                                    | 'cash'
                                    | 'pix'
                                    | 'card'
                                    | 'installment',
                                status: 'pending',
                                items,
                            };

                            await updateSale.mutateAsync({
                                id: Number(editSale.id),
                                data: payload,
                            });
                            toast.success('Venda atualizada com sucesso.');
                            setIsEditOpen(false);
                            setEditSale(null);
                        } catch (error) {
                            const message =
                                error instanceof Error && error.message
                                    ? error.message
                                    : 'Erro ao atualizar a venda.';
                            toast.error(message);
                        }
                    }}
                    clients={salesDialogCustomers}
                    products={salesDialogProducts}
                    onCreateClient={handleCreateClient}
                    onCreateProduct={handleCreateProduct}
                    sale={editSale}
                />
            )}
        </div>
    );
}
