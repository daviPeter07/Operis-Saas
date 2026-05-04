import { Search } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { initialPurchaseForm } from '@/constants/dashboard-form-initials';
import { useFormState } from '@/hooks/use-form-state';
import { useQuickCreateSupplier } from '@/hooks/use-quick-create-supplier';
import { formatCurrencyBR } from '@/lib/format';
import type {
    PurchaseCreateDialogProps,
    PurchaseLineItem,
} from '@/types/dashboard-forms';
import {
    computePurchaseTotals,
    mapFinancialFormToPurchase,
} from '@/utils/dashboard-financial';
import { FinancialEntryDialog } from '../shared/financial-entry-dialog';

export function PurchaseCreateDialog({
    open,
    onOpenChange,
    onSubmit,
    products,
    suppliers,
    onCreateSupplier,
    onApplyStock,
}: PurchaseCreateDialogProps) {
    const { form, setField } = useFormState(initialPurchaseForm, open);
    const handleQuickCreateSupplier = useQuickCreateSupplier({
        onCreateSupplier,
        onSupplierCreated: (supplier) =>
            setField('supplierName', supplier.name),
    });
    const [productSearch, setProductSearch] = React.useState('');
    const [items, setItems] = React.useState<
        { productId: string; quantity: string }[]
    >([{ productId: '', quantity: '1' }]);

    React.useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setProductSearch('');
             
            setItems([{ productId: '', quantity: '1' }]);
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

    const addProductToCart = (productId: string) => {
        setItems((prev) => {
            const lineIndex = prev.findIndex(
                (item) => item.productId === productId,
            );

            if (lineIndex === -1) {
                return [...prev, { productId, quantity: '1' }];
            }

            const next = [...prev];
            const currentQty = Number(next[lineIndex].quantity || 0);
            next[lineIndex] = {
                ...next[lineIndex],
                quantity: String(currentQty + 1),
            };

            return next;
        });
    };

    const updateLine = (
        index: number,
        key: 'productId' | 'quantity',
        value: string,
    ) => {
        setItems((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [key]: value };

            return next;
        });
    };

    const removeLine = (index: number) => {
        setItems((prev) => {
            const next = [...prev];
            next.splice(index, 1);

            return next.length > 0 ? next : [{ productId: '', quantity: '1' }];
        });
    };

    const parsedItems: PurchaseLineItem[] = items
        .map((item) => ({
            productId: item.productId,
            quantity: Number(item.quantity || 0),
        }))
        .filter((item) => item.productId && item.quantity > 0);

    const computedTotals = computePurchaseTotals(parsedItems, products);

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
                subtotal: product.cost * item.quantity,
            };
        })
        .filter(Boolean);

    return (
        <FinancialEntryDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Nova Compra"
            description="Dialogo alinhado ao fluxo de vendas, com dados focados em compras."
            primarySectionTitle="Dados da compra"
            submitLabel="Salvar compra"
            form={form}
            onChange={setField}
            suppliers={suppliers}
            onCreateSupplier={handleQuickCreateSupplier}
            catalogSection={
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={productSearch}
                            onChange={(event) =>
                                setProductSearch(event.currentTarget.value)
                            }
                            placeholder="Buscar produto por nome, SKU ou codigo de barras..."
                            className="pl-9"
                        />
                    </div>

                    <div className="grid gap-3">
                        {visibleProducts.map((product) => (
                            <button
                                key={product.id}
                                type="button"
                                onClick={() => addProductToCart(product.id)}
                                className="grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                    <span className="text-xs font-semibold">
                                        {product.name.slice(0, 2).toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {product.name}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {product.sku}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold">
                                    {formatCurrencyBR(product.cost)}
                                </span>
                            </button>
                        ))}

                        {visibleProducts.length === 0 ? (
                            <p className="py-12 text-center text-sm text-muted-foreground">
                                Nenhum produto encontrado.
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-3 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold">
                                Carrinho da compra
                            </h3>
                        </div>

                        {cartItems.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Nenhum item adicionado na compra.
                            </p>
                        ) : (
                            cartItems.map((item) => {
                                const lineIndex = items.findIndex(
                                    (line) =>
                                        line.productId === item.product.id,
                                );

                                return (
                                    <div
                                        key={item.product.id}
                                        className="rounded-md border p-3"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {item.product.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatCurrencyBR(
                                                        item.product.cost,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => {
                                                        if (lineIndex === -1) {
                                                            return;
                                                        }

                                                        const current = Number(
                                                            items[lineIndex]
                                                                ?.quantity || 0,
                                                        );

                                                        if (current <= 1) {
                                                            removeLine(
                                                                lineIndex,
                                                            );

                                                            return;
                                                        }

                                                        updateLine(
                                                            lineIndex,
                                                            'quantity',
                                                            String(current - 1),
                                                        );
                                                    }}
                                                >
                                                    -
                                                </Button>
                                                <span className="w-6 text-center text-sm">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => {
                                                        if (lineIndex === -1) {
                                                            return;
                                                        }

                                                        const current = Number(
                                                            items[lineIndex]
                                                                ?.quantity || 0,
                                                        );
                                                        updateLine(
                                                            lineIndex,
                                                            'quantity',
                                                            String(current + 1),
                                                        );
                                                    }}
                                                >
                                                    +
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        if (lineIndex !== -1) {
                                                            removeLine(
                                                                lineIndex,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    Remover
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Subtotal:{' '}
                                            {formatCurrencyBR(item.subtotal)}
                                        </p>
                                    </div>
                                );
                            })
                        )}

                        <div className="grid gap-2 text-sm text-muted-foreground">
                            <p>Itens calculados: {computedTotals.items}</p>
                            <p>
                                Total calculado:{' '}
                                {formatCurrencyBR(computedTotals.total)}
                            </p>
                        </div>
                    </div>
                </div>
            }
            summaryLabel="Total da compra"
            onSubmit={() => {
                onApplyStock(parsedItems);
                onSubmit(mapFinancialFormToPurchase(form, computedTotals));
            }}
        />
    );
}
