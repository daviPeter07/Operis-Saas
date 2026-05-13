import * as React from 'react';
import { CatalogPanel } from '@/components/sales-dialog/catalog-panel';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductDialog } from '@/features/dashboard/inventory/product-dialog';
import { SupplierCreateDialog } from '@/features/dashboard/suppliers/supplier-create-dialog';
import { useCreateBrand } from '@/hooks/use-brands';
import { useCreateCategory } from '@/hooks/use-categories';
import type { UiPurchase } from '@/types/dashboard-entities';
import type { UiProduct } from '@/types/dashboard-entities';
import type {
    PurchaseCreateDialogProps,
    PurchaseLineItem,
} from '@/types/dashboard-forms';
import type { SalesLineItem } from '@/types/sales-dialog';
import { computePurchaseTotals } from '@/utils/dashboard-financial';
import {
    applyFieldMask,
    onlyDigits,
    parseMaskedFieldValue,
} from '@/utils/form-fields';
import { PurchaseCheckoutPanel } from './purchase-checkout-panel';
import { PurchaseConfirmationDialog } from './purchase-confirmation-dialog';

interface AddPurchaseProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    catalogProduct: UiProduct | null;
    catalogUnitCost: string;
    setCatalogUnitCost: (value: string) => void;
    catalogQuantity: string;
    setCatalogQuantity: (value: string) => void;
    onConfirm: () => void;
}

export function AddPurchaseProductDialog({
    open,
    onOpenChange,
    catalogProduct,
    catalogUnitCost,
    setCatalogUnitCost,
    catalogQuantity,
    setCatalogQuantity,
    onConfirm,
}: AddPurchaseProductDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Adicionar produto</DialogTitle>
                    <DialogDescription>
                        Confirme o preço de compra e a quantidade.
                    </DialogDescription>
                </DialogHeader>

                {catalogProduct && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-[56px_1fr] items-center gap-3 rounded-lg border p-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <span className="text-xs font-semibold">
                                    {catalogProduct.name
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {catalogProduct.sku}
                                </p>
                                <p className="font-medium">
                                    {catalogProduct.name}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Preço de compra</Label>
                            <Input
                                type="text"
                                value={catalogUnitCost}
                                onChange={(event) =>
                                    setCatalogUnitCost(
                                        applyFieldMask(
                                            event.currentTarget.value,
                                            'currency',
                                        ),
                                    )
                                }
                                placeholder="R$ 0,00"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Quantidade</Label>
                            <div className="flex w-fit items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        setCatalogQuantity(
                                            String(
                                                Math.max(
                                                    1,
                                                    (Number(catalogQuantity) ||
                                                        1) - 1,
                                                ),
                                            ),
                                        )
                                    }
                                >
                                    -
                                </Button>
                                <Input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={catalogQuantity}
                                    onChange={(event) =>
                                        setCatalogQuantity(
                                            event.currentTarget.value,
                                        )
                                    }
                                    className="w-20 text-center"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        setCatalogQuantity(
                                            String(
                                                Math.max(
                                                    1,
                                                    (Number(catalogQuantity) ||
                                                        1) + 1,
                                                ),
                                            ),
                                        )
                                    }
                                >
                                    +
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="button"
                            className="w-full"
                            onClick={onConfirm}
                        >
                            Adicionar
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

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
    onCreateProduct,
    onApplyStock,
    mode = 'create',
    initialData,
    initialItems,
}: PurchaseCreateDialogProps) {
    const [productSearch, setProductSearch] = React.useState('');
    const [items, setItems] = React.useState<DraftPurchaseLine[]>([]);
    const [isScannerReady, setIsScannerReady] = React.useState(false);
    const [productCreateOpen, setProductCreateOpen] = React.useState(false);
    const [supplierCreateOpen, setSupplierCreateOpen] = React.useState(false);
    const [supplierSearch, setSupplierSearch] = React.useState('');
    const [selectedSupplierId, setSelectedSupplierId] = React.useState('');
    const [createdSupplier, setCreatedSupplier] = React.useState<{
        id: string;
        name: string;
    } | null>(null);
    const [purchaseDate, setPurchaseDate] = React.useState(
        new Date().toISOString().slice(0, 10),
    );
    const [calendarOpen, setCalendarOpen] = React.useState(false);
    const [paymentMethod, setPaymentMethod] = React.useState<
        'money' | 'pix' | 'card' | 'boleto'
    >('pix');
    const [cardType, setCardType] = React.useState<'debit' | 'credit'>('debit');
    const [boletoTermDays, setBoletoTermDays] = React.useState('30');
    const [notes, setNotes] = React.useState('');
    const [addProductDialogOpen, setAddProductDialogOpen] =
        React.useState(false);
    const [catalogProductId, setCatalogProductId] = React.useState('');
    const [catalogUnitCost, setCatalogUnitCost] = React.useState('0');
    const [catalogQuantity, setCatalogQuantity] = React.useState('1');
    const [confirmationOpen, setConfirmationOpen] = React.useState(false);
    const [purchaseDraft, setPurchaseDraft] = React.useState<UiPurchase | null>(
        null,
    );
    const createBrand = useCreateBrand();
    const createCategory = useCreateCategory();
    const isEditMode = mode === 'edit';

    const purchaseItems = React.useMemo(
        () =>
            (initialItems ?? []).map((item) => ({
                productId: item.productId,
                quantity: String(item.quantity),
                unitCost: String(item.unitCost),
            })),
        [initialItems],
    );

    React.useEffect(() => {
        if (open) {
            if (mode === 'edit' && initialData) {
                setProductSearch('');
                setItems(purchaseItems);
                setIsScannerReady(false);
                setSupplierSearch(initialData.supplierName);
                setSelectedSupplierId(initialData.supplierId);
                setPurchaseDate(initialData.createdAt.slice(0, 10));
                setCalendarOpen(false);
                setNotes('');

                if (
                    initialData.paymentMethod === 'credit' ||
                    initialData.paymentMethod === 'debit'
                ) {
                    setPaymentMethod('card');
                    setCardType(initialData.paymentMethod);
                } else if (initialData.paymentMethod === 'boleto') {
                    setPaymentMethod('boleto');
                    setBoletoTermDays(initialData.boletoTermDays ?? '30');
                } else if (initialData.paymentMethod === 'cash') {
                    setPaymentMethod('money');
                } else {
                    setPaymentMethod('pix');
                }
            } else {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setProductSearch('');
                setItems([]);
                setIsScannerReady(false);
                setSupplierSearch('');
                setSelectedSupplierId('');
                setCreatedSupplier(null);
                setPurchaseDate(new Date().toISOString().slice(0, 10));
                setCalendarOpen(false);
                setPaymentMethod('pix');
                setCardType('debit');
                setBoletoTermDays('30');
                setNotes('');
            }
        }
    }, [initialData, initialItems, mode, open, purchaseItems]);

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
        const supplierOptions = createdSupplier
            ? [
                  ...suppliers,
                  {
                      id: createdSupplier.id,
                      name: createdSupplier.name,
                      email: '',
                      phone: '',
                      document: '',
                      city: '',
                      state: '',
                      address: '',
                      createdAt: new Date().toISOString().slice(0, 10),
                  },
              ]
            : suppliers;
        const normalized = supplierSearch.trim().toLowerCase();

        if (!normalized) {
            return supplierOptions;
        }

        return supplierOptions.filter((supplier) =>
            supplier.name.toLowerCase().includes(normalized),
        );
    }, [createdSupplier, supplierSearch, suppliers]);

    const selectedSupplier = React.useMemo(
        () =>
            suppliers.find((supplier) => supplier.id === selectedSupplierId) ??
            (createdSupplier?.id === selectedSupplierId
                ? {
                      id: createdSupplier.id,
                      name: createdSupplier.name,
                      email: '',
                      phone: '',
                      document: '',
                      city: '',
                      state: '',
                      address: '',
                      createdAt: new Date().toISOString().slice(0, 10),
                  }
                : null) ??
            null,
        [createdSupplier, selectedSupplierId, suppliers],
    );

    const handleAddFromCatalog = (productId: string) => {
        const product = products.find((entry) => entry.id === productId);

        if (!product) {
            return;
        }

        setCatalogProductId(productId);
        setCatalogUnitCost(
            applyFieldMask(String((product.cost || 0) * 100), 'currency'),
        );
        setCatalogQuantity('1');
        setAddProductDialogOpen(true);
    };

    const confirmAddFromCatalog = () => {
        const productId = catalogProductId;

        if (!productId) {
            return;
        }

        const quantityValue = Math.max(1, Number(catalogQuantity || 1));
        const unitCostValue = Math.max(
            0,
            Number(parseMaskedFieldValue(catalogUnitCost, 'currency') || 0),
        );

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

    const parsedItems: (PurchaseLineItem & { productName?: string })[] = items
        .map((item) => {
            const product = products.find(
                (entry) => entry.id === item.productId,
            );

            return {
                productId: item.productId,
                quantity: Number(item.quantity || 0),
                unitCost: Number(item.unitCost || 0),
                productName: product?.name,
            };
        })
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

    const handleFinalizePurchase = () => {
        if (!selectedSupplier || checkoutLineItems.length === 0) {
            return;
        }

        const draft: UiPurchase = {
            id: crypto.randomUUID(),
            supplierId: selectedSupplier.id,
            supplierName: selectedSupplier.name,
            total: computedTotals.total,
            status: 'pending', // será sobrescrito pelo diálogo de confirmação
            paymentMethod: paymentMethod === 'card' ? cardType : paymentMethod,
            dueDate: paymentMethod === 'boleto' ? undefined : undefined,
            boletoTermDays:
                paymentMethod === 'boleto' ? boletoTermDays : undefined,
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
                            boletoTermDays={boletoTermDays}
                            setBoletoTermDays={setBoletoTermDays}
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

                    <AddPurchaseProductDialog
                        open={addProductDialogOpen}
                        onOpenChange={setAddProductDialogOpen}
                        catalogProduct={
                            products.find(
                                (entry) => entry.id === catalogProductId,
                            ) ?? null
                        }
                        catalogUnitCost={catalogUnitCost}
                        setCatalogUnitCost={setCatalogUnitCost}
                        catalogQuantity={catalogQuantity}
                        setCatalogQuantity={setCatalogQuantity}
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

            <ProductDialog
                open={productCreateOpen}
                onOpenChange={setProductCreateOpen}
                mode="create"
                brands={brands.map((brand) => ({
                    value: String(brand.id),
                    label: brand.name,
                }))}
                categories={categories.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                }))}
                onSubmit={async (data) => {
                    const created = await onCreateProduct({
                        name: data.name.trim(),
                        sku: data.sku.trim(),
                        barcode: data.barcode || '',
                        categoryId: Number(data.category_id),
                        brandId: data.brand_id ? Number(data.brand_id) : null,
                        cost: Number(data.cost || 0),
                        price: Number(data.sale_price || 0),
                        stock: Number(data.stock || 0),
                        minStock: Number(data.min_stock || 0),
                        createdAt: new Date().toISOString().slice(0, 10),
                    });

                    handleAddFromCatalog(created.id);
                }}
                onCreateBrand={async (name) => {
                    return createBrand.mutateAsync({ name, status: 'active' });
                }}
                onCreateCategory={async (name) => {
                    return createCategory.mutateAsync({
                        name,
                        status: 'active',
                    });
                }}
            />

            <SupplierCreateDialog
                open={supplierCreateOpen}
                onOpenChange={setSupplierCreateOpen}
                onSuccess={({ id, name }) => {
                    const supplierId = String(id);
                    setCreatedSupplier({ id: supplierId, name });
                    setSelectedSupplierId(supplierId);
                    setSupplierSearch(name);
                }}
            />
        </>
    );
}
