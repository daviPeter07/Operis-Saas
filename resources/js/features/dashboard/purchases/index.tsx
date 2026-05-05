import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import { PAYMENT_METHOD_OPTIONS } from '@/constants/payment-methods';
import { STATUS_OPTIONS } from '@/constants/status';
import { useProducts } from '@/hooks/use-products';
import { useCreateSupplier } from '@/hooks/use-suppliers';
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
import type {
    UiProduct,
    UiPurchase,
    UiSupplier,
} from '@/types/dashboard-entities';
import type { PurchaseLineItem } from '@/types/dashboard-forms';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { PurchaseCreateDialog } from './purchase-create-dialog';

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
    const createSupplier = useCreateSupplier();
    const deletePurchase = useDeletePurchase();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [dialogSuppliers, setDialogSuppliers] = useState<UiSupplier[]>([]);
    const draftItemsRef = useRef<PurchaseLineItem[]>([]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get('action') === 'create-purchase') {
            setIsCreateOpen(true);
            window.history.replaceState({}, '', '/dashboard/purchases');
        }
    }, []);

    const mappedSuppliers = useMemo<UiSupplier[]>(
        () =>
            suppliers.map((supplier) => ({
                id: String(supplier.id),
                name: supplier.name,
                email: supplier.email ?? '',
                phone: supplier.phone ?? '',
                document: supplier.document ?? '',
                city: '',
                state: '',
                address: '',
                createdAt: new Date().toISOString().slice(0, 10),
            })),
        [suppliers],
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

    const dialogSupplierOptions = useMemo(
        () => [...dialogSuppliers, ...mappedSuppliers],
        [dialogSuppliers, mappedSuppliers],
    );

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

    const handleCreateSupplier = (supplier: UiSupplier): UiSupplier => {
        setDialogSuppliers((previous) => [supplier, ...previous]);

        void createSupplier.mutateAsync({
            name: supplier.name,
            email: supplier.email,
            phone: supplier.phone,
            document: supplier.document,
        });

        return supplier;
    };

    const handleCreateFromDialog = async (purchase: UiPurchase) => {
        const supplier = dialogSupplierOptions.find(
            (entry) => entry.name === purchase.supplierName,
        );
        const supplierId = Number(supplier?.id ?? 0);

        if (!supplierId || Number.isNaN(supplierId)) {
            throw new Error('Selecione um fornecedor válido para continuar.');
        }

        const items = draftItemsRef.current
            .map((item) => {
                const product = mappedProducts.find(
                    (entry) => entry.id === item.productId,
                );

                return {
                    product_id: Number(item.productId),
                    quantity: Number(item.quantity),
                    unit_cost: Number(product?.cost ?? 0),
                };
            })
            .filter(
                (item) =>
                    Number.isFinite(item.product_id) &&
                    item.product_id > 0 &&
                    Number.isFinite(item.quantity) &&
                    item.quantity > 0 &&
                    Number.isFinite(item.unit_cost) &&
                    item.unit_cost >= 0,
            );

        if (items.length === 0) {
            throw new Error('Adicione ao menos um produto na compra.');
        }

        const paymentMethod: 'cash' | 'pix' | 'card' | 'installment' =
            purchase.paymentMethod === 'money'
                ? 'cash'
                : purchase.paymentMethod === 'debit' ||
                    purchase.paymentMethod === 'credit'
                  ? 'card'
                  : purchase.paymentMethod === 'installment'
                    ? 'installment'
                    : 'pix';

        await createPurchase.mutateAsync({
            supplier_id: supplierId,
            date: purchase.createdAt || new Date().toISOString().slice(0, 10),
            due_date: purchase.dueDate || undefined,
            payment_method: paymentMethod,
            status: 'pending',
            items,
        });

        draftItemsRef.current = [];
        toast.success('Compra criada com sucesso.');
    };

    return (
        <GenericTable
            data={rows}
            columns={columns}
            title="Compras"
            filterFields={filterFields}
            onDelete={async (row) => {
                await deletePurchase.mutateAsync(Number(row.id));
            }}
            isCreateOpen={isCreateOpen}
            onCreateOpenChange={setIsCreateOpen}
            createDialog={({ open, onOpenChange }) => (
                <PurchaseCreateDialog
                    open={open}
                    onOpenChange={onOpenChange}
                    onSubmit={(purchase) => {
                        void handleCreateFromDialog(purchase)
                            .then(() => {
                                onOpenChange(false);
                            })
                            .catch((error: unknown) => {
                                const message =
                                    error instanceof Error && error.message
                                        ? error.message
                                        : 'Erro ao criar a compra.';

                                toast.error(message);
                            });
                    }}
                    products={mappedProducts}
                    suppliers={dialogSupplierOptions}
                    onCreateSupplier={handleCreateSupplier}
                    onApplyStock={(items) => {
                        draftItemsRef.current = items;
                    }}
                />
            )}
        />
    );
}
