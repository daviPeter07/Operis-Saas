import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import { useAccountPayables } from '@/hooks/use-account-payables';
import { useBrands } from '@/hooks/use-brands';
import { useCategories } from '@/hooks/use-categories';
import { useProducts } from '@/hooks/use-products';
import { useCreateProduct } from '@/hooks/use-products';
import {
    useCreatePurchase,
    useDeletePurchase,
    usePurchases,
} from '@/hooks/use-purchases';
import { useCreateSupplier } from '@/hooks/use-suppliers';
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
import { PurchaseHeader } from './purchase-header';

type PurchaseRow = {
    id: string; // unique row identifier (may include payable id for boleto rows)
    purchaseId: number; // actual purchase primary key used for actions like delete
    supplier_id: number;
    supplierName: string;
    productNames: string;
    categoryNames: string;
    brandNames: string;
    total: number;
    status: string;
    payment_method: string;
    date: string;
    installments: number | null; // installment number for boleto
    total_installments: number | null;
    // optional fields for individual installment rows
    payableId?: number;
    installment_number: number | null; // allow null (matches API schema)
    due_date?: string;
    entry_date?: string;
    amount?: number;
};

function hasSamePurchaseMetricsRows(
    previous: PurchaseRow[],
    next: PurchaseRow[],
): boolean {
    if (previous.length !== next.length) {
        return false;
    }

    for (let index = 0; index < previous.length; index += 1) {
        const prevRow = previous[index];
        const nextRow = next[index];

        if (
            prevRow.id !== nextRow.id ||
            prevRow.status !== nextRow.status ||
            prevRow.total !== nextRow.total
        ) {
            return false;
        }
    }

    return true;
}

export function PurchasesModule() {
    const { data: purchases = [], isPending: isPurchasesPending } =
        usePurchases();
    const { data: payables = [] } = useAccountPayables();
    const { data: suppliers = [], isPending: isSuppliersPending } =
        useSuppliers();
    const { data: products = [], isPending: isProductsPending } = useProducts();
    const { data: categories = [], isPending: isCategoriesPending } =
        useCategories();
    const { data: brands = [], isPending: isBrandsPending } = useBrands();
    const createPurchase = useCreatePurchase();
    const createProduct = useCreateProduct();
    const createSupplier = useCreateSupplier();
    const deletePurchase = useDeletePurchase();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [dialogSuppliers, setDialogSuppliers] = useState<UiSupplier[]>([]);
    const [dialogProducts, setDialogProducts] = useState<UiProduct[]>([]);
    const draftItemsRef = useRef<PurchaseLineItem[]>([]);
    const [filteredRows, setFilteredRows] = useState<PurchaseRow[]>([]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get('action') === 'create-purchase') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
    const dialogProductOptions = useMemo(
        () => [...dialogProducts, ...mappedProducts],
        [dialogProducts, mappedProducts],
    );

    const suppliersById = new Map(
        suppliers.map((supplier) => [supplier.id, supplier.name]),
    );

    const rows: PurchaseRow[] = [];
    purchases
        .filter((purchase) => purchase.status !== 'cancelled')
        .forEach((purchase) => {
            const productNames = Array.from(
                new Set(
                    (purchase.items ?? [])
                        .map((item) => item.product_name?.trim())
                        .filter((value): value is string => Boolean(value)),
                ),
            );
            const categoryNames = Array.from(
                new Set(
                    (purchase.items ?? [])
                        .map((item) => item.category_name?.trim())
                        .filter((value): value is string => Boolean(value)),
                ),
            );
            const brandNames = Array.from(
                new Set(
                    (purchase.items ?? [])
                        .map((item) => item.brand_name?.trim())
                        .filter((value): value is string => Boolean(value)),
                ),
            );

            if (purchase.payment_method === 'boleto') {
                // Find related payables for this purchase
                const related = payables.filter(
                    (p) => p.purchase_id === purchase.id,
                );
                const totalInst = related.length || 2; // fallback if not loaded yet
                related.forEach((pay) => {
                    rows.push({
                        id: `${purchase.id}-${pay.id}`,
                        purchaseId: purchase.id,
                        supplier_id: purchase.supplier_id,
                        supplierName:
                            suppliersById.get(purchase.supplier_id) ||
                            `#${purchase.supplier_id}`,
                        productNames: productNames.join(', ') || '-',
                        categoryNames: categoryNames.join(', ') || '-',
                        brandNames: brandNames.join(', ') || '-',
                        total: purchase.total,
                        status: purchase.status,
                        payment_method: purchase.payment_method,
                        date: purchase.date,
                        installments: pay.installment_number ?? null,
                        total_installments: totalInst,
                        payableId: pay.id,
                        installment_number: pay.installment_number,
                        due_date: pay.due_date,
                        entry_date: purchase.date,
                        amount: pay.amount,
                    });
                });
            } else {
                rows.push({
                    id: String(purchase.id),
                    purchaseId: purchase.id,
                    supplier_id: purchase.supplier_id,
                    supplierName:
                        suppliersById.get(purchase.supplier_id) ||
                        `#${purchase.supplier_id}`,
                    productNames: productNames.join(', ') || '-',
                    categoryNames: categoryNames.join(', ') || '-',
                    brandNames: brandNames.join(', ') || '-',
                    total: purchase.total,
                    status: purchase.status,
                    payment_method: purchase.payment_method,
                    date: purchase.date,
                    installments: null,
                    total_installments: null,
                    installment_number: null,
                });
            }
        });

    const handleFilteredDataChange = useCallback((nextRows: PurchaseRow[]) => {
        setFilteredRows((previous) =>
            hasSamePurchaseMetricsRows(previous, nextRows)
                ? previous
                : nextRows,
        );
    }, []);

    const metrics = useMemo(() => {
        const baseRows = filteredRows;
        const purchaseCount = baseRows.length;
        const purchaseTotal = baseRows.reduce(
            (sum, purchase) => sum + purchase.total,
            0,
        );
        const payable = baseRows
            .filter((purchase) => purchase.status === 'pending')
            .reduce((sum, purchase) => sum + purchase.total, 0);

        return {
            purchaseCount,
            purchaseTotal,
            payable,
        };
    }, [filteredRows]);

    const columns: Column<PurchaseRow>[] = [
        { key: 'supplierName', header: 'Fornecedor' },
        { key: 'productNames', header: 'Produto' },
        { key: 'categoryNames', header: 'Categoria' },
        { key: 'brandNames', header: 'Marca' },
        {
            key: 'total',
            header: 'Total',
            render: (val: unknown) => formatCurrencyBR(Number(val)),
        },
        {
            key: 'status',
            header: 'Status',
            render: (val: unknown) => <StatusBadge status={String(val)} />, // mostra badge de status
        },
        {
            key: 'payment_method',
            header: 'Método',
            render: (val: unknown) => translatePaymentMethod(String(val)),
        },
        {
            key: 'installments',
            header: 'Parcela',
            render: (val: unknown, row: PurchaseRow) => {
                if (val === null || val === undefined) {
                    return '-';
                }

                const total = row.total_installments;

                if (total && total >= 1) {
                    return `${val}/${total}`;
                }

                return '-';
            },
        },
        {
            key: 'date',
            header: 'Data',
            render: (val: unknown) => formatDateBR(String(val)),
        },
        {
            key: 'due_date',
            header: 'Vencimento',
            render: (val: unknown) => {
                if (!val) {
                    return '-';
                }

                return formatDateBR(String(val));
            },
        },
    ];

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
        toast.success('Produto criado com sucesso.');

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

        const paymentMethod:
            | 'cash'
            | 'pix'
            | 'card'
            | 'installment'
            | 'boleto' =
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
                    ? (Number(purchase.boletoTermDays ?? 30) as
                          | 30
                          | 60
                          | 90
                          | 120)
                    : undefined,
            status: purchase.status === 'completed' ? 'completed' : 'pending',
            items,
        });

        draftItemsRef.current = [];
        toast.success('Compra criada com sucesso.');
    };

    return (
        <div className="space-y-5">
            <PurchaseHeader metrics={metrics} />

            <GenericTable
                data={rows}
                columns={columns}
                title="Compras"
                loading={
                    isPurchasesPending ||
                    isSuppliersPending ||
                    isProductsPending ||
                    isCategoriesPending ||
                    isBrandsPending
                }
                sortableColumns={[
                    { key: 'productNames', type: 'text' },
                    { key: 'categoryNames', type: 'text' },
                    { key: 'brandNames', type: 'text' },
                    { key: 'date', type: 'date' },
                ]}
                dateFilterKey="date"
                onFilteredDataChange={handleFilteredDataChange}
                onDelete={async (row) => {
                    await deletePurchase.mutateAsync(Number(row.purchaseId));
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
