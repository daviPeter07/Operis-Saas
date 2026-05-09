import * as React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { UiPurchase } from '@/types/dashboard-entities';
import type { SalesLineItem } from '@/types/sales-dialog';
import { CatalogPanel } from '@/components/sales-dialog/catalog-panel';
import { AddProductDialog } from '@/components/sales-dialog/dialogs';
import { QuickCreateDialog } from '@/features/dashboard/sales/quick-create-dialog';
import { SupplierCreateDialog } from '@/features/dashboard/suppliers/supplier-create-dialog';
import type {
    PurchaseCreateDialogProps,
    PurchaseLineItem,
} from '@/types/dashboard-forms';
import type { QuickCreateField } from '@/types/quick-create';
import { computePurchaseTotals } from '@/utils/dashboard-financial';
import { PurchaseConfirmationDialog } from './purchase-confirmation-dialog';
import { PurchaseCheckoutPanel } from './purchase-checkout-panel';

type DraftPurchaseLine = {
    productId: string;
    quantity: string;
    unitCost: string;
};

export function PurchaseCreateDialog({
    open,
    onOpenChange,
    onSubmit,
    products,
    suppliers,
    categories,
    brands,
    onCreateSupplier,
    onCreateProduct,
    onApplyStock,
}: PurchaseCreateDialogProps) {
    const [productSearch, setProductSearch] = React.useState('');
    const [items, setItems] = React.useState<DraftPurchaseLine[]>([]);
    const [isScannerReady, setIsScannerReady] = React.useState(false);
    const [productCreateOpen, setProductCreateOpen] = React.useState(false);
    const [supplierCreateOpen, setSupplierCreateOpen] = React.useState(false);
    const [supplierSearch, setSupplierSearch] = React.useState('');
    const [selectedSupplierId, setSelectedSupplierId] = React.useState('');
    const [purchaseDate, setPurchaseDate] = React.useState(
        new Date().toISOString().slice(0, 10),
    );
    const [calendarOpen, setCalendarOpen] = React.useState(false);
    const [paymentMethod, setPaymentMethod] = React.useState<
        'money' | 'pix' | 'card' | 'boleto'
    >('pix');
    const [cardType, setCardType] = React.useState<'debit' | 'credit'>('debit');
    const [notes, setNotes] = React.useState('');
    const [addProductDialogOpen, setAddProductDialogOpen] =
        React.useState(false);
    const [catalogProductId, setCatalogProductId] = React.useState('');
    const [catalogUnitCost, setCatalogUnitCost] = React.useState('0');
    const [catalogQuantity, setCatalogQuantity] = React.useState('1');
    const [showCostPrice, setShowCostPrice] = React.useState(false);
    const [confirmationOpen, setConfirmationOpen] = React.useState(false);
    const [purchaseDraft, setPurchaseDraft] = React.useState<UiPurchase | null>(
        null,
    );

    React.useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setProductSearch('');
            setItems([]);
            setIsScannerReady(false);
            setSupplierSearch('');
            setSelectedSupplierId('');
            setPurchaseDate(new Date().toISOString().slice(0, 10));
            setCalendarOpen(false);
            setPaymentMethod('pix');
            setCardType('debit');
            setNotes('');
        }
    }, [open]);

    const visibleProducts = React.useMemo(() => {
        const normalized = productSearch.trim().toLowerCase();

        if (!normalized) {
            return products;
        }

        return products.filter((product) => {
            return (
                product.name.toLowerCase().includes(normalized) ||
                product.sku.toLowerCase().includes(normalized) ||
                String(product.barcode || '')
                    .toLowerCase()
                    .includes(normalized)
            );
        });
    }, [productSearch, products]);

    const filteredSuppliers = React.useMemo(() => {
        const normalized = supplierSearch.trim().toLowerCase();

        if (!normalized) {
            return suppliers;
        }

        return suppliers.filter((supplier) =>
            supplier.name.toLowerCase().includes(normalized),
        );
    }, [supplierSearch, suppliers]);

    const selectedSupplier = React.useMemo(
        () =>
            suppliers.find((supplier) => supplier.id === selectedSupplierId) ??
            null,
        [suppliers, selectedSupplierId],
    );

    const handleAddFromCatalog = (productId: string) => {
        const product = products.find((entry) => entry.id === productId);
        if (!product) {
            return;
        }

        setCatalogProductId(productId);
        setCatalogUnitCost(String(product.cost || 0));
        setCatalogQuantity('1');
        setShowCostPrice(false);
        setAddProductDialogOpen(true);
    };

    const confirmAddFromCatalog = () => {
        const productId = catalogProductId;
        if (!productId) {
            return;
        }

        const quantityValue = Math.max(1, Number(catalogQuantity || 1));
        const unitCostValue = Math.max(0, Number(catalogUnitCost || 0));

        setItems((previous) => {
            const lineIndex = previous.findIndex(
                (item) =>
                    item.productId === productId &&
                    Number(item.unitCost) === unitCostValue,
            );

            if (lineIndex === -1) {
                return [
                    ...previous,
                    {
                        productId,
                        quantity: String(quantityValue),
                        unitCost: String(unitCostValue),
                    },
                ];
            }

            const next = [...previous];
            const currentQty = Number(next[lineIndex].quantity || 0);
            next[lineIndex] = {
                ...next[lineIndex],
                quantity: String(currentQty + quantityValue),
            };

            return next;
        });

        setAddProductDialogOpen(false);
    };

    const updateLine = (
        index: number,
        key: keyof DraftPurchaseLine,
        value: string,
    ) => {
        setItems((previous) => {
            const next = [...previous];
            next[index] = { ...next[index], [key]: value };

            return next;
        });
    };

    const removeLine = (index: number) => {
        setItems((previous) =>
            previous.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    const findLineIndexByCheckoutId = (id: string): number => {
        return items.findIndex(
            (item) => `${item.productId}-${Number(item.unitCost || 0)}` === id,
        );
    };

    const increaseLineItemQuantity = (id: string) => {
        const lineIndex = findLineIndexByCheckoutId(id);
        if (lineIndex === -1) {
            return;
        }

        const current = Number(items[lineIndex]?.quantity || 0);
        updateLine(lineIndex, 'quantity', String(current + 1));
    };

    const decreaseLineItemQuantity = (id: string) => {
        const lineIndex = findLineIndexByCheckoutId(id);
        if (lineIndex === -1) {
            return;
        }

        const current = Number(items[lineIndex]?.quantity || 0);
        if (current <= 1) {
            removeLine(lineIndex);
            return;
        }

        updateLine(lineIndex, 'quantity', String(current - 1));
    };

    const removeLineItem = (id: string) => {
        const lineIndex = findLineIndexByCheckoutId(id);
        if (lineIndex === -1) {
            return;
        }
        removeLine(lineIndex);
    };

    const parsedItems: PurchaseLineItem[] = items
        .map((item) => ({
            productId: item.productId,
            quantity: Number(item.quantity || 0),
            unitCost: Number(item.unitCost || 0),
        }))
        .filter(
            (item) =>
                item.productId.length > 0 &&
                item.quantity > 0 &&
                Number.isFinite(item.unitCost) &&
                item.unitCost >= 0,
        );

    const computedTotals = computePurchaseTotals(parsedItems);

    const cartItems = parsedItems
        .map((item) => {
            const product = products.find(
                (entry) => entry.id === item.productId,
            );

            if (!product) {
                return null;
            }

            return {
                product,
                quantity: item.quantity,
                unitCost: item.unitCost,
                subtotal: item.unitCost * item.quantity,
            };
        })
        .filter(
            (
                item,
            ): item is {
                product: (typeof products)[number];
                quantity: number;
                unitCost: number;
                subtotal: number;
            } => item !== null,
        );

    const checkoutLineItems: SalesLineItem[] = cartItems.map((item) => ({
        id: `${item.product.id}-${item.unitCost}`,
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        unitPrice: item.unitCost,
        unitCost: item.unitCost,
        subtotal: item.subtotal,
    }));

    const canSubmit = Boolean(selectedSupplier && checkoutLineItems.length > 0);

    const productQuickFields = React.useMemo<QuickCreateField[]>(
        () => [
            {
                name: 'name',
                label: 'Nome do produto',
                type: 'text',
                required: true,
            },
            {
                name: 'sku',
                label: 'Codigo interno',
                type: 'text',
                required: true,
            },
            {
                name: 'barcode',
                label: 'Codigo de barras',
                type: 'text',
            },
            {
                name: 'category',
                label: 'Categoria',
                type: 'select',
                required: true,
                searchable: true,
                options: categories.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                })),
            },
            {
                name: 'brand',
                label: 'Marca',
                type: 'select',
                searchable: true,
                options: brands.map((brand) => ({
                    value: String(brand.id),
                    label: brand.name,
                })),
            },
            {
                name: 'cost',
                label: 'Custo',
                type: 'text',
                required: true,
                mask: 'currency',
            },
            {
                name: 'price',
                label: 'Preco de venda',
                type: 'text',
                required: true,
                mask: 'currency',
            },
            {
                name: 'stock',
                label: 'Estoque inicial',
                type: 'number',
                required: true,
            },
            {
                name: 'minStock',
                label: 'Estoque minimo',
                type: 'number',
                required: true,
            },
            {
                name: 'createdAt',
                label: 'Data de cadastro',
                type: 'date',
                required: true,
            },
        ],
        [brands, categories],
    );

    const handleFinalizePurchase = () => {
        if (!selectedSupplier || checkoutLineItems.length === 0) {
            return;
        }

        const draft: UiPurchase = {
            id: crypto.randomUUID(),
            supplierId: selectedSupplier.id,
            supplierName: selectedSupplier.name,
            total: computedTotals.total,
            status: 'pending',
            paymentMethod: paymentMethod === 'card' ? cardType : paymentMethod,
            dueDate: paymentMethod === 'boleto' ? undefined : undefined,
            boletoTermDays: paymentMethod === 'boleto' ? '30' : undefined,
            createdAt: purchaseDate,
            items: checkoutLineItems.reduce(
                (sum, item) => sum + item.quantity,
                0,
            ),
        };

        setPurchaseDraft(draft);
        setConfirmationOpen(true);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-[min(1700px,calc(100vw-1rem))] overflow-y-auto p-0 sm:max-w-[min(1700px,calc(100vw-1rem))]">
                    <div className="grid max-h-[calc(100dvh-1rem)] min-h-[calc(100dvh-1rem)] grid-cols-1 lg:h-[min(90dvh,calc(100dvh-1rem))] lg:grid-cols-[1.35fr_0.65fr]">
                        <CatalogPanel
                            productSearch={productSearch}
                            setProductSearch={setProductSearch}
                            isScannerReady={isScannerReady}
                            onToggleScanner={() =>
                                setIsScannerReady((current) => !current)
                            }
                            onOpenCreateProduct={() =>
                                setProductCreateOpen(true)
                            }
                            visibleProducts={visibleProducts}
                            onAddFromCatalog={(product) =>
                                handleAddFromCatalog(product.id)
                            }
                        />

                        <PurchaseCheckoutPanel
                            supplierSearch={supplierSearch}
                            setSupplierSearch={setSupplierSearch}
                            filteredSuppliers={filteredSuppliers}
                            selectedSupplier={selectedSupplier}
                            selectSupplierById={(id) => {
                                setSelectedSupplierId(id);
                                const supplier = suppliers.find(
                                    (entry) => entry.id === id,
                                );
                                setSupplierSearch(supplier?.name || '');
                            }}
                            openCreateSupplier={() =>
                                setSupplierCreateOpen(true)
                            }
                            lineItems={checkoutLineItems}
                            increaseLineItemQuantity={increaseLineItemQuantity}
                            decreaseLineItemQuantity={decreaseLineItemQuantity}
                            removeLineItem={removeLineItem}
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            cardType={cardType}
                            setCardType={setCardType}
                            total={computedTotals.total}
                            notes={notes}
                            setNotes={setNotes}
                            purchaseDate={purchaseDate}
                            calendarOpen={calendarOpen}
                            setCalendarOpen={setCalendarOpen}
                            setPurchaseDate={setPurchaseDate}
                            canSubmit={canSubmit}
                            onSubmit={handleFinalizePurchase}
                        />
                    </div>

                    <AddProductDialog
                        open={addProductDialogOpen}
                        onOpenChange={setAddProductDialogOpen}
                        catalogProduct={
                            products.find(
                                (entry) => entry.id === catalogProductId,
                            ) ?? null
                        }
                        catalogSalePrice={catalogUnitCost}
                        setCatalogSalePrice={setCatalogUnitCost}
                        catalogQuantity={catalogQuantity}
                        setCatalogQuantity={setCatalogQuantity}
                        showCostPrice={showCostPrice}
                        setShowCostPrice={setShowCostPrice}
                        onConfirm={confirmAddFromCatalog}
                    />
                </DialogContent>
            </Dialog>

            <PurchaseConfirmationDialog
                open={confirmationOpen}
                onOpenChange={setConfirmationOpen}
                purchaseDraft={purchaseDraft}
                items={parsedItems}
                onConfirm={(purchase) => {
                    onApplyStock(parsedItems);
                    onSubmit(purchase);
                    setConfirmationOpen(false);
                }}
            />

            <QuickCreateDialog
                open={productCreateOpen}
                onOpenChange={setProductCreateOpen}
                title="Novo produto"
                description="Cadastre um produto sem sair da compra."
                fields={productQuickFields}
                initialValues={{
                    cost: 'R$ 0,00',
                    price: 'R$ 0,00',
                    stock: '0',
                    minStock: '0',
                }}
                submitLabel="Salvar produto"
                keepOpenAfterSubmit={false}
                onSubmit={async (values) => {
                    const createdProduct = await onCreateProduct({
                        name: String(values.name || '').trim(),
                        sku: String(values.sku || '').trim(),
                        barcode: String(values.barcode || '').trim(),
                        categoryId: Number(values.category),
                        brandId: values.brand ? Number(values.brand) : null,
                        cost: Number(values.cost || 0),
                        price: Number(values.price || 0),
                        stock: Number(values.stock || 0),
                        minStock: Number(values.minStock || 0),
                        createdAt:
                            values.createdAt ||
                            new Date().toISOString().slice(0, 10),
                    });

                    handleAddFromCatalog(createdProduct.id);

                    return createdProduct;
                }}
            />

            <SupplierCreateDialog
                open={supplierCreateOpen}
                onOpenChange={setSupplierCreateOpen}
                onSuccess={({ id, name }) => {
                    void onCreateSupplier({
                        id: String(id),
                        name,
                        email: '',
                        phone: '',
                        document: '',
                        city: '',
                        state: '',
                        address: '',
                        createdAt: new Date().toISOString().slice(0, 10),
                    }).then((supplier) => {
                        setSelectedSupplierId(supplier.id);
                        setSupplierSearch(supplier.name);
                    });
                }}
            />
        </>
    );
}
