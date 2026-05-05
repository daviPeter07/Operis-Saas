import {
    AlertTriangle,
    Barcode,
    PackagePlus,
    PackageSearch,
    Search,
} from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { initialPurchaseForm } from '@/constants/dashboard-form-initials';
import { QuickCreateDialog } from '@/features/dashboard/sales/quick-create-dialog';
import { SupplierCreateDialog } from '@/features/dashboard/suppliers/supplier-create-dialog';
import { useFormState } from '@/hooks/use-form-state';
import { formatCurrencyBR } from '@/lib/format';
import type {
    PurchaseCreateDialogProps,
    PurchaseLineItem,
} from '@/types/dashboard-forms';
import type { QuickCreateField } from '@/types/quick-create';
import {
    computePurchaseTotals,
    mapFinancialFormToPurchase,
} from '@/utils/dashboard-financial';
import { FinancialEntryDialog } from '../shared/financial-entry-dialog';

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
    const { form, setField } = useFormState(initialPurchaseForm, open);
    const [productSearch, setProductSearch] = React.useState('');
    const [items, setItems] = React.useState<DraftPurchaseLine[]>([]);
    const [isScannerReady, setIsScannerReady] = React.useState(false);
    const [productCreateOpen, setProductCreateOpen] = React.useState(false);
    const [supplierCreateOpen, setSupplierCreateOpen] = React.useState(false);

    React.useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setProductSearch('');
            setItems([]);
            setIsScannerReady(false);
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
        setItems((previous) => {
            const lineIndex = previous.findIndex(
                (item) => item.productId === productId,
            );
            const product = products.find((entry) => entry.id === productId);
            const defaultUnitCost = String(product?.cost ?? 0);

            if (lineIndex === -1) {
                return [
                    ...previous,
                    {
                        productId,
                        quantity: '1',
                        unitCost: defaultUnitCost,
                    },
                ];
            }

            const next = [...previous];
            const currentQty = Number(next[lineIndex].quantity || 0);
            next[lineIndex] = {
                ...next[lineIndex],
                quantity: String(currentQty + 1),
                unitCost: next[lineIndex].unitCost || defaultUnitCost,
            };

            return next;
        });
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

    React.useEffect(() => {
        setField('items', String(computedTotals.items));
        setField('total', computedTotals.total.toFixed(2));
    }, [computedTotals.items, computedTotals.total, setField]);

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

    return (
        <>
            <FinancialEntryDialog
                open={open}
                onOpenChange={onOpenChange}
                title="Nova compra"
                description="Fluxo operacional de reposicao com leitura de estoque e ajuste de custo por item."
                primarySectionTitle="Fechamento da compra"
                submitLabel="Salvar compra"
                form={form}
                onChange={setField}
                suppliers={suppliers}
                onOpenCreateSupplier={() => setSupplierCreateOpen(true)}
                summaryLabel="Total da compra"
                catalogSection={
                    <div className="space-y-4">
                        <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={productSearch}
                                    onChange={(event) =>
                                        setProductSearch(
                                            event.currentTarget.value,
                                        )
                                    }
                                    onKeyDown={(event) => {
                                        if (
                                            !isScannerReady ||
                                            event.key !== 'Enter'
                                        ) {
                                            return;
                                        }

                                        event.preventDefault();

                                        const normalized = productSearch
                                            .trim()
                                            .toLowerCase();

                                        if (!normalized) {
                                            return;
                                        }

                                        const matchedProduct = products.find(
                                            (product) => {
                                                return (
                                                    String(
                                                        product.barcode || '',
                                                    )
                                                        .trim()
                                                        .toLowerCase() ===
                                                        normalized ||
                                                    product.sku
                                                        .trim()
                                                        .toLowerCase() ===
                                                        normalized
                                                );
                                            },
                                        );

                                        if (!matchedProduct) {
                                            return;
                                        }

                                        addProductToCart(matchedProduct.id);
                                        setProductSearch('');
                                    }}
                                    placeholder="Buscar produto por nome, SKU ou codigo de barras"
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    type="button"
                                    variant={
                                        isScannerReady ? 'default' : 'outline'
                                    }
                                    className="border-primary/40"
                                    onClick={() =>
                                        setIsScannerReady((current) => !current)
                                    }
                                >
                                    <Barcode className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setProductCreateOpen(true)}
                                >
                                    <PackagePlus className="mr-2 h-4 w-4" />
                                    Criar produto
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-2 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
                            <p className="text-muted-foreground">
                                {isScannerReady
                                    ? 'Leitor ativo. Informe o codigo de barras ou SKU para adicionar automaticamente.'
                                    : 'Pesquise, escaneie ou cadastre produtos sem sair da compra.'}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm sm:min-w-72">
                                <div className="rounded-lg border bg-background px-3 py-2">
                                    <p className="text-xs text-muted-foreground">
                                        Itens no carrinho
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {computedTotals.items}
                                    </p>
                                </div>
                                <div className="rounded-lg border bg-background px-3 py-2">
                                    <p className="text-xs text-muted-foreground">
                                        Total estimado
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {formatCurrencyBR(computedTotals.total)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.75fr)]">
                            <div className="space-y-3">
                                {visibleProducts.length === 0 ? (
                                    <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-6 text-center">
                                        <PackageSearch className="mb-3 h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm font-medium">
                                            Nenhum produto encontrado
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Ajuste a busca ou cadastre novos
                                            itens no estoque.
                                        </p>
                                    </div>
                                ) : (
                                    visibleProducts.map((product) => {
                                        const needsRestock =
                                            product.stock <= product.minStock;

                                        return (
                                            <button
                                                key={product.id}
                                                type="button"
                                                onClick={() =>
                                                    addProductToCart(product.id)
                                                }
                                                className="grid w-full grid-cols-[56px_1fr_auto] items-center gap-3 rounded-xl border p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                                            >
                                                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                    <span className="text-xs font-semibold">
                                                        {product.name
                                                            .slice(0, 2)
                                                            .toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="truncate text-sm font-medium">
                                                            {product.name}
                                                        </p>
                                                        {needsRestock ? (
                                                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Reposicao
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                        <span>
                                                            {product.sku}
                                                        </span>
                                                        {product.barcode ? (
                                                            <span>
                                                                CB:{' '}
                                                                {
                                                                    product.barcode
                                                                }
                                                            </span>
                                                        ) : null}
                                                        <span>
                                                            Estoque:{' '}
                                                            {product.stock}
                                                        </span>
                                                        <span>
                                                            Minimo:{' '}
                                                            {product.minStock}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold">
                                                        {formatCurrencyBR(
                                                            product.cost,
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        custo atual
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            <div className="space-y-3 rounded-xl border bg-card p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            Carrinho da compra
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Revise quantidade, custo unitario e
                                            impacto da reposicao.
                                        </p>
                                    </div>
                                </div>

                                {cartItems.length === 0 ? (
                                    <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                                        Adicione produtos para montar a
                                        reposicao.
                                    </div>
                                ) : (
                                    cartItems.map((item) => {
                                        const lineIndex = items.findIndex(
                                            (line) =>
                                                line.productId ===
                                                item.product.id,
                                        );

                                        return (
                                            <div
                                                key={item.product.id}
                                                className="rounded-xl border p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">
                                                            {item.product.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.product.sku} ·
                                                            Estoque atual:{' '}
                                                            {item.product.stock}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            if (
                                                                lineIndex !== -1
                                                            ) {
                                                                removeLine(
                                                                    lineIndex,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        Remover
                                                    </Button>
                                                </div>

                                                <div className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr_132px]">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => {
                                                                if (
                                                                    lineIndex ===
                                                                    -1
                                                                ) {
                                                                    return;
                                                                }

                                                                const current =
                                                                    Number(
                                                                        items[
                                                                            lineIndex
                                                                        ]
                                                                            ?.quantity ||
                                                                            0,
                                                                    );

                                                                if (
                                                                    current <= 1
                                                                ) {
                                                                    removeLine(
                                                                        lineIndex,
                                                                    );

                                                                    return;
                                                                }

                                                                updateLine(
                                                                    lineIndex,
                                                                    'quantity',
                                                                    String(
                                                                        current -
                                                                            1,
                                                                    ),
                                                                );
                                                            }}
                                                        >
                                                            -
                                                        </Button>
                                                        <span className="w-8 text-center text-sm font-medium">
                                                            {item.quantity}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => {
                                                                if (
                                                                    lineIndex ===
                                                                    -1
                                                                ) {
                                                                    return;
                                                                }

                                                                const current =
                                                                    Number(
                                                                        items[
                                                                            lineIndex
                                                                        ]
                                                                            ?.quantity ||
                                                                            0,
                                                                    );
                                                                updateLine(
                                                                    lineIndex,
                                                                    'quantity',
                                                                    String(
                                                                        current +
                                                                            1,
                                                                    ),
                                                                );
                                                            }}
                                                        >
                                                            +
                                                        </Button>
                                                    </div>

                                                    <div className="grid gap-1">
                                                        <label className="text-xs font-medium text-muted-foreground">
                                                            Custo unitario
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={
                                                                items[lineIndex]
                                                                    ?.unitCost ??
                                                                String(
                                                                    item.unitCost,
                                                                )
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) => {
                                                                if (
                                                                    lineIndex ===
                                                                    -1
                                                                ) {
                                                                    return;
                                                                }

                                                                updateLine(
                                                                    lineIndex,
                                                                    'unitCost',
                                                                    event
                                                                        .currentTarget
                                                                        .value,
                                                                );
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="rounded-lg border bg-muted/30 px-3 py-2 text-right">
                                                        <p className="text-xs text-muted-foreground">
                                                            Subtotal
                                                        </p>
                                                        <p className="text-sm font-semibold">
                                                            {formatCurrencyBR(
                                                                item.subtotal,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                }
                onSubmit={() => {
                    onApplyStock(parsedItems);
                    onSubmit(mapFinancialFormToPurchase(form, computedTotals));
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

                    addProductToCart(createdProduct.id);

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
                        setField('supplierName', supplier.name);
                    });
                }}
            />
        </>
    );
}
