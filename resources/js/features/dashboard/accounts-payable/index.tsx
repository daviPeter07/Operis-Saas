import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import {
    useCreatePurchase,
} from '@/hooks/use-purchases';
import { useBrands } from '@/hooks/use-brands';
import { useCategories } from '@/hooks/use-categories';
import { useCreateProduct, useProducts } from '@/hooks/use-products';
import {
    useAccountPayables,
    useSettleAccountPayable,
} from '@/hooks/use-account-payables';
import { useCreateSupplier, useSuppliers } from '@/hooks/use-suppliers';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import type { UiProduct, UiPurchase, UiSupplier } from '@/types/dashboard-entities';
import type { PurchaseLineItem } from '@/types/dashboard-forms';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { PurchaseCreateDialog } from '../purchases/purchase-create-dialog';

type PayableRow = {
    id: string;
    purchase_id: number;
    installment_number: number;
    amount: number;
    due_date: string;
    status: string;
    paid_at: string | null;
    paid_method: string | null;
};

export function AccountsPayableModule() {
    const { data: payables = [], isPending: isPayablesPending } =
        useAccountPayables();
    const { data: products = [] } = useProducts();
    const { data: categories = [] } = useCategories();
    const { data: brands = [] } = useBrands();
    const createProduct = useCreateProduct();
    const createPurchase = useCreatePurchase();
    const { data: suppliers = [] } = useSuppliers();
    const createSupplier = useCreateSupplier();
    const settleAccountPayable = useSettleAccountPayable();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [dialogSuppliers, setDialogSuppliers] = useState<UiSupplier[]>([]);
    const [dialogProducts, setDialogProducts] = useState<UiProduct[]>([]);
    const draftItemsRef = useRef<PurchaseLineItem[]>([]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get('action') === 'create-expense') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsCreateOpen(true);
            window.history.replaceState({}, '', '/dashboard/accounts-payable');
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

    const dialogSupplierOptions = useMemo(
        () => [...dialogSuppliers, ...mappedSuppliers],
        [dialogSuppliers, mappedSuppliers],
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
    const dialogProductOptions = useMemo(
        () => [...dialogProducts, ...mappedProducts],
        [dialogProducts, mappedProducts],
    );

    const rows: PayableRow[] = payables
        .filter((payable) => payable.status === 'pending')
        .map((payable) => ({
            id: String(payable.id),
            purchase_id: payable.purchase_id,
            installment_number: payable.installment_number,
            amount: payable.amount,
            due_date: payable.due_date,
            status: payable.status,
            paid_at: payable.paid_at,
            paid_method: payable.paid_method,
        }));

    const handleSelectOne = (id: string, checked: boolean) => {
        const next = new Set(selectedIds);

        if (checked) {
            next.add(id);
        } else {
            next.delete(id);
        }

        setSelectedIds(next);
    };

    const handleConfirmPayment = async () => {
        const ids = Array.from(selectedIds).map((id) => Number(id));

        if (ids.length === 0) {
            return;
        }

        await Promise.all(
            ids.map((id) =>
                settleAccountPayable.mutateAsync({
                    id,
                    paid_at: new Date().toISOString().slice(0, 10),
                    paid_method: 'pix',
                }),
            ),
        );

        toast.success(`${ids.length} conta(s) baixada(s) com sucesso.`);
        setSelectedIds(new Set());
    };

    const totalSelected = selectedIds.size;
    const totalValue = rows
        .filter((row) => selectedIds.has(row.id))
        .reduce((sum, row) => sum + row.amount, 0);

    const handleCreateSupplier = async (
        supplier: UiSupplier,
    ): Promise<UiSupplier> => {
        const createdSupplier = await createSupplier.mutateAsync({
            name: supplier.name,
            email: supplier.email,
            phone: supplier.phone,
            document: supplier.document,
        });

        const mappedSupplier: UiSupplier = {
            id: String(createdSupplier.id),
            name: createdSupplier.name,
            email: createdSupplier.email ?? '',
            phone: createdSupplier.phone ?? '',
            document: createdSupplier.document ?? '',
            city: '',
            state: '',
            address: '',
            createdAt: new Date().toISOString().slice(0, 10),
        };

        setDialogSuppliers((previous) => [mappedSupplier, ...previous]);

        return mappedSupplier;
    };

    const handleCreateProduct = async (product: {
        name: string;
        sku: string;
        barcode: string;
        categoryId: number;
        brandId: number | null;
        cost: number;
        price: number;
        stock: number;
        minStock: number;
        createdAt: string;
    }): Promise<UiProduct> => {
        const createdProduct = await createProduct.mutateAsync({
            name: product.name,
            sku: product.sku,
            barcode: product.barcode || null,
            description: null,
            sale_price: product.price,
            cost: product.cost,
            stock: product.stock,
            min_stock: product.minStock,
            category_id: product.categoryId,
            brand_id: product.brandId,
        });

        const mappedProduct: UiProduct = {
            id: String(createdProduct.id),
            name: createdProduct.name,
            sku: createdProduct.sku,
            barcode: createdProduct.barcode ?? undefined,
            category: String(createdProduct.category_id),
            brand: String(createdProduct.brand_id ?? ''),
            price: Number(createdProduct.sale_price ?? 0),
            cost: Number(createdProduct.cost ?? 0),
            stock: Number(createdProduct.stock ?? 0),
            minStock: Number(createdProduct.min_stock ?? 0),
            createdAt: product.createdAt,
        };

        setDialogProducts((previous) => [mappedProduct, ...previous]);

        return mappedProduct;
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
            .map((item) => ({
                product_id: Number(item.productId),
                quantity: Number(item.quantity),
                unit_cost: Number(item.unitCost ?? 0),
            }))
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

        const paymentMethod: 'cash' | 'pix' | 'card' | 'installment' | 'boleto' =
            purchase.paymentMethod === 'money'
                ? 'cash'
                : purchase.paymentMethod === 'boleto'
                  ? 'boleto'
                : purchase.paymentMethod === 'debit' ||
                    purchase.paymentMethod === 'credit'
                  ? 'card'
                  : purchase.paymentMethod === 'installment'
                    ? 'installment'
                    : 'pix';

        await createPurchase.mutateAsync({
            supplier_id: supplierId,
            date: purchase.createdAt || new Date().toISOString().slice(0, 10),
            due_date:
                paymentMethod === 'boleto'
                    ? undefined
                    : purchase.dueDate || undefined,
            payment_method: paymentMethod,
            boleto_term_days:
                paymentMethod === 'boleto'
                    ? ((Number(
                          purchase.boletoTermDays ?? 30,
                      ) as 30 | 60 | 90 | 120))
                    : undefined,
            status: purchase.status === 'completed' ? 'completed' : 'pending',
            items,
        });

        draftItemsRef.current = [];
        toast.success('Compra criada com sucesso.');
    };

    const columns: Column<PayableRow>[] = [
        {
            key: 'select',
            header: (
                <input
                    type="checkbox"
                    checked={
                        selectedIds.size === rows.length && rows.length > 0
                    }
                    ref={(el) => {
                        if (el) {
                            el.indeterminate =
                                selectedIds.size > 0 &&
                                selectedIds.size < rows.length;
                        }
                    }}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedIds(new Set(rows.map((row) => row.id)));
                        } else {
                            setSelectedIds(new Set());
                        }
                    }}
                    className="h-4 w-4 cursor-pointer rounded border border-gray-400 accent-gray-600"
                />
            ),
            render: (_, row: PayableRow) => (
                <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={(e) => handleSelectOne(row.id, e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border border-gray-400 accent-gray-600"
                />
            ),
        },
        {
            key: 'purchase_id',
            header: 'Compra',
            render: (val: unknown) => `#${String(val)}`,
        },
        { key: 'installment_number', header: 'Parcela' },
        {
            key: 'amount',
            header: 'Valor',
            render: (val: unknown) => formatCurrencyBR(Number(val)),
        },
        {
            key: 'status',
            header: 'Status',
            render: (val: unknown) => <StatusBadge status={String(val)} />,
        },
        {
            key: 'due_date',
            header: 'Vencimento',
            render: (val: unknown) => formatDateBR(String(val)),
        },
    ];

    return (
        <div className="space-y-4">
            {totalSelected > 0 && (
                <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                    <div>
                        <p className="font-medium">
                            {totalSelected} selecionada(s)
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Total: {formatCurrencyBR(totalValue)}
                        </p>
                    </div>
                    <button
                        onClick={() => void handleConfirmPayment()}
                        className="inline-flex h-9 items-center justify-center rounded-md bg-gray-600 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                    >
                        Marcar como Paga
                    </button>
                </div>
            )}
            <GenericTable
                data={rows}
                columns={columns}
                title="Contas a Pagar"
                loading={isPayablesPending}
                sortableColumns={[{ key: 'due_date', type: 'date' }]}
                dateFilterKey="due_date"
                clickableRow
                onRowClick={(row) =>
                    handleSelectOne(row.id, !selectedIds.has(row.id))
                }
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
                        products={dialogProductOptions}
                        suppliers={dialogSupplierOptions}
                        categories={categories.map((category) => ({
                            id: category.id,
                            name: category.name,
                        }))}
                        brands={brands.map((brand) => ({
                            id: brand.id,
                            name: brand.name,
                        }))}
                        onCreateSupplier={handleCreateSupplier}
                        onCreateProduct={handleCreateProduct}
                        onApplyStock={(items) => {
                            draftItemsRef.current = items;
                        }}
                    />
                )}
            />
        </div>
    );
}
