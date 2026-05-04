import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    Barcode,
    CalendarDays,
    Eye,
    EyeOff,
    PackagePlus,
    Search,
    Trash2,
    UserPlus,
    X,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Combobox,
    ComboboxCollection,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSalesDialog } from '@/hooks/use-sales-dialog';
import { formatCurrencyBR } from '@/lib/format';
import type { Client, Product } from '@/lib/mocks/mock-data';
import type {
    SaleDiscountType,
    SalesLineItem,
    SalesRecord,
} from '@/types/sales-dialog';
import {
    filterProductsByQuery,
    paymentMethodOptions,
} from '@/utils/sales-dialog';
import { QuickCreateDialog } from './quick-create-dialog';

interface SalesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (sale: SalesRecord) => void;
    clients: Client[];
    products: Product[];
    onCreateClient: (client: Client) => Client;
    onCreateProduct: (product: Product) => Product;
}

export function SalesDialog({
    open,
    onOpenChange,
    onSubmit,
    clients,
    products,
    onCreateClient,
    onCreateProduct,
}: SalesDialogProps) {
    const {
        addSelectedProduct,
        addProductToCart,
        applyDiscount,
        appliedDiscountType,
        appliedDiscountValue,
        canSubmit,
        clientCreateOpen,
        clientId,
        clientQuickFields,
        clientSearch,
        decreaseLineItemQuantity,
        discountAmountApplied,
        discountType,
        discountValue,
        finalTotal,
        increaseLineItemQuantity,
        lineItems,
        notes,
        paymentMethod,
        productCreateOpen,
        productId,
        productQuickFields,
        productSearch,
        saleDate,
        selectedClient,
        selectedProduct,
        total,
        removeLineItem,
        selectClientById,
        selectProductById,
        setClientCreateOpen,
        setClientSearch,
        setDiscountType,
        setDiscountValue,
        setIsScannerReady,
        isScannerReady,
        setNotes,
        setPaymentMethod,
        setProductCreateOpen,
        setProductSearch,
        setSaleDate,
    } = useSalesDialog({ open, clients, products });

    const [discountDialogOpen, setDiscountDialogOpen] = React.useState(false);
    const [calendarOpen, setCalendarOpen] = React.useState(false);
    const [addProductDialogOpen, setAddProductDialogOpen] =
        React.useState(false);
    const [catalogProduct, setCatalogProduct] = React.useState<Product | null>(
        null,
    );
    const [catalogSalePrice, setCatalogSalePrice] = React.useState('0');
    const [catalogQuantity, setCatalogQuantity] = React.useState('1');
    const [showCostPrice, setShowCostPrice] = React.useState(false);

    const visibleProducts = React.useMemo(
        () => filterProductsByQuery(products, productSearch),
        [products, productSearch],
    );
    const filteredClients = React.useMemo(() => {
        const normalizedQuery = clientSearch.trim().toLowerCase();

        if (!normalizedQuery) {
            return clients;
        }

        return clients.filter((client) =>
            client.name.toLowerCase().includes(normalizedQuery),
        );
    }, [clientSearch, clients]);

    const handleAddFromCatalog = (product: Product) => {
        setCatalogProduct(product);
        setCatalogSalePrice(String(product.price.toFixed(2)));
        setCatalogQuantity('1');
        setShowCostPrice(false);
        setAddProductDialogOpen(true);
    };

    const confirmAddProductFromCatalog = () => {
        if (!catalogProduct) {
            return;
        }

        addProductToCart(
            catalogProduct,
            Number(catalogQuantity || 1),
            Number(catalogSalePrice.replace(',', '.') || 0),
        );
        setAddProductDialogOpen(false);
    };

    const handleSubmit = () => {
        if (!selectedClient || lineItems.length === 0) {
            return;
        }

        onSubmit({
            id: crypto.randomUUID(),
            clientId: selectedClient.id,
            clientName: selectedClient.name,
            total: finalTotal,
            status: 'pending',
            paymentMethod,
            items: lineItems.reduce((sum, item) => sum + item.quantity, 0),
            createdAt: saleDate,
            lineItems,
            notes,
            discountType: appliedDiscountType,
            discountValue: appliedDiscountValue,
            discountAmountApplied,
            finalTotal,
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[min(1700px,calc(100vw-1rem))] overflow-hidden p-0 sm:max-w-[min(1700px,calc(100vw-1rem))]">
                <div className="grid h-[90vh] grid-cols-1 lg:grid-cols-[1.35fr_0.65fr]">
                    <section className="flex min-h-0 flex-col border-r">
                        <div className="flex gap-3 border-b p-4">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={productSearch}
                                    onChange={(event) =>
                                        setProductSearch(
                                            event.currentTarget.value,
                                        )
                                    }
                                    placeholder="Buscar produto, codigo ou codigo de barras..."
                                    className="pl-9"
                                />
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant={
                                            isScannerReady
                                                ? 'default'
                                                : 'outline'
                                        }
                                        className="border-primary/40"
                                        onClick={() =>
                                            setIsScannerReady(
                                                (current) => !current,
                                            )
                                        }
                                    >
                                        <Barcode className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Leitor de codigo de barras
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setProductCreateOpen(true)
                                        }
                                    >
                                        <PackagePlus className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Criar produto</TooltipContent>
                            </Tooltip>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-4">
                            <div className="grid gap-3">
                                {visibleProducts.map((product) => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() =>
                                            handleAddFromCatalog(product)
                                        }
                                        className="grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                                    >
                                        <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                            <span className="text-xs font-semibold">
                                                {product.name
                                                    .slice(0, 2)
                                                    .toUpperCase()}
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
                                            {formatCurrencyBR(product.price)}
                                        </span>
                                    </button>
                                ))}
                                {visibleProducts.length === 0 && (
                                    <p className="py-12 text-center text-sm text-muted-foreground">
                                        Nenhum produto encontrado.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="flex min-h-0 flex-col bg-card">
                        <div className="border-b p-4">
                            <DialogHeader className="text-left">
                                <DialogTitle className="text-lg">
                                    Finalizar venda
                                </DialogTitle>
                                <DialogDescription>
                                    Cliente, itens, pagamento e fechamento.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-4">
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm">
                                                Cliente
                                            </CardTitle>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        onClick={() =>
                                                            setClientCreateOpen(
                                                                true,
                                                            )
                                                        }
                                                    >
                                                        <UserPlus className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Criar cliente
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="relative">
                                            <Input
                                                value={clientSearch}
                                                onChange={(event) =>
                                                    setClientSearch(
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                                placeholder="Buscar cliente"
                                                className="pr-10"
                                            />
                                            {selectedClient &&
                                            clientSearch ===
                                                selectedClient.name ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    onClick={() =>
                                                        selectClientById('')
                                                    }
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            ) : null}
                                        </div>
                                        <div className="max-h-44 overflow-y-auto rounded-md border">
                                            {filteredClients.length === 0 ? (
                                                <p className="px-3 py-2 text-sm text-muted-foreground">
                                                    Nenhum cliente encontrado.
                                                </p>
                                            ) : (
                                                filteredClients.map(
                                                    (client) => (
                                                        <button
                                                            key={client.id}
                                                            type="button"
                                                            onClick={() =>
                                                                selectClientById(
                                                                    client.id,
                                                                )
                                                            }
                                                            className="w-full border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted"
                                                        >
                                                            {client.name}
                                                        </button>
                                                    ),
                                                )
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">
                                            Carrinho
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {lineItems.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                Nenhum item no carrinho.
                                            </p>
                                        ) : (
                                            lineItems.map(
                                                (item: SalesLineItem) => (
                                                    <div
                                                        key={item.id}
                                                        className="rounded-md border p-2"
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-medium">
                                                                    {
                                                                        item.productName
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatCurrencyBR(
                                                                        item.unitPrice,
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Tooltip>
                                                                    <TooltipTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            onClick={() =>
                                                                                decreaseLineItemQuantity(
                                                                                    item.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            -
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        Diminuir
                                                                        quantidade
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                                <span className="w-6 text-center text-sm">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>
                                                                <Tooltip>
                                                                    <TooltipTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            onClick={() =>
                                                                                increaseLineItemQuantity(
                                                                                    item.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            +
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        Aumentar
                                                                        quantidade
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                                <Tooltip>
                                                                    <TooltipTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() =>
                                                                                removeLineItem(
                                                                                    item.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        Remover
                                                                        item
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            )
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">
                                            Forma de pagamento
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ToggleGroup
                                            type="single"
                                            value={paymentMethod}
                                            onValueChange={(value) => {
                                                if (
                                                    value === 'money' ||
                                                    value === 'pix' ||
                                                    value === 'card' ||
                                                    value === 'other'
                                                ) {
                                                    setPaymentMethod(value);
                                                }
                                            }}
                                            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                                        >
                                            {paymentMethodOptions.map(
                                                (option) => (
                                                    <ToggleGroupItem
                                                        key={option.value}
                                                        value={option.value}
                                                        variant="outline"
                                                        className="rounded-md border"
                                                    >
                                                        {option.label}
                                                    </ToggleGroupItem>
                                                ),
                                            )}
                                        </ToggleGroup>
                                    </CardContent>
                                </Card>

                                <div className="space-y-2 rounded-md border p-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Subtotal
                                        </span>
                                        <span>{formatCurrencyBR(total)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Desconto
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-primary">
                                                -{' '}
                                                {formatCurrencyBR(
                                                    discountAmountApplied,
                                                )}
                                            </span>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            setDiscountDialogOpen(
                                                                true,
                                                            )
                                                        }
                                                    >
                                                        Aplicar
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Aplicar desconto
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold">
                                            Total
                                        </span>
                                        <span className="text-3xl font-black text-primary">
                                            {formatCurrencyBR(finalTotal)}
                                        </span>
                                    </div>
                                </div>

                                <Textarea
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(event.currentTarget.value)
                                    }
                                    placeholder="Observacoes (opcional)"
                                    rows={3}
                                    className="h-24 resize-none"
                                />

                                <div className="space-y-2">
                                    <Label>Data</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() =>
                                            setCalendarOpen(
                                                (current) => !current,
                                            )
                                        }
                                    >
                                        <CalendarDays className="mr-2 h-4 w-4" />
                                        {saleDate
                                            ? format(
                                                  new Date(saleDate),
                                                  'dd/MM/yyyy',
                                                  { locale: ptBR },
                                              )
                                            : 'Selecionar data'}
                                    </Button>
                                    {calendarOpen && (
                                        <div className="rounded-md border p-2">
                                            <Calendar
                                                mode="single"
                                                selected={
                                                    saleDate
                                                        ? new Date(saleDate)
                                                        : undefined
                                                }
                                                onSelect={(date) => {
                                                    if (date) {
                                                        setSaleDate(
                                                            date
                                                                .toISOString()
                                                                .slice(0, 10),
                                                        );
                                                    }

                                                    setCalendarOpen(false);
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    className="w-full"
                                    size="lg"
                                    disabled={!canSubmit}
                                    onClick={handleSubmit}
                                >
                                    Finalizar venda
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>

                <Dialog
                    open={discountDialogOpen}
                    onOpenChange={setDiscountDialogOpen}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Aplicar desconto</DialogTitle>
                            <DialogDescription>
                                Defina desconto em valor ou porcentagem.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <ToggleGroup
                                type="single"
                                value={discountType}
                                onValueChange={(value) => {
                                    if (
                                        value === 'amount' ||
                                        value === 'percent'
                                    ) {
                                        setDiscountType(value);
                                    }
                                }}
                                variant="outline"
                                className="w-full"
                            >
                                <ToggleGroupItem
                                    value="amount"
                                    className="flex-1"
                                >
                                    Valor (R$)
                                </ToggleGroupItem>
                                <ToggleGroupItem
                                    value="percent"
                                    className="flex-1"
                                >
                                    %
                                </ToggleGroupItem>
                            </ToggleGroup>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={discountValue}
                                onChange={(event) =>
                                    setDiscountValue(event.currentTarget.value)
                                }
                            />
                            <Button
                                type="button"
                                className="w-full"
                                onClick={() => {
                                    applyDiscount();
                                    setDiscountDialogOpen(false);
                                }}
                            >
                                Aplicar desconto
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={addProductDialogOpen}
                    onOpenChange={setAddProductDialogOpen}
                >
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Adicionar produto</DialogTitle>
                            <DialogDescription>
                                Confirme os dados do item para inserir no
                                carrinho.
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
                                    <Label>Preco de venda</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={catalogSalePrice}
                                        onChange={(event) =>
                                            setCatalogSalePrice(
                                                event.currentTarget.value,
                                            )
                                        }
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
                                                setCatalogQuantity((current) =>
                                                    String(
                                                        Math.max(
                                                            1,
                                                            (Number(current) ||
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
                                                setCatalogQuantity((current) =>
                                                    String(
                                                        Math.max(
                                                            1,
                                                            (Number(current) ||
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

                                <div className="rounded-md border p-3 text-sm">
                                    <div className="mb-1 flex items-center justify-between">
                                        <p className="text-muted-foreground">
                                            Preco de compra
                                        </p>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() =>
                                                setShowCostPrice(
                                                    (current) => !current,
                                                )
                                            }
                                        >
                                            {showCostPrice ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="font-semibold">
                                        {showCostPrice
                                            ? formatCurrencyBR(
                                                  catalogProduct.cost,
                                              )
                                            : '••••••'}
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    className="w-full"
                                    onClick={confirmAddProductFromCatalog}
                                >
                                    Adicionar
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <QuickCreateDialog<Client>
                    open={clientCreateOpen}
                    onOpenChange={setClientCreateOpen}
                    title="Novo cliente"
                    description="Cadastre um cliente sem sair da venda atual."
                    fields={clientQuickFields}
                    submitLabel="Salvar cliente"
                    keepOpenAfterSubmit
                    onSubmit={async (values) => {
                        const createdClient: Client = onCreateClient({
                            id: crypto.randomUUID(),
                            name: String(values.name || '').trim(),
                            email: String(values.email || '').trim(),
                            phone: String(values.phone || '').trim(),
                            document: String(values.document || '').trim(),
                            city: String(values.city || '').trim(),
                            state: String(values.state || '').trim(),
                            address: String(values.address || '').trim(),
                            createdAt:
                                values.createdAt ||
                                new Date().toISOString().slice(0, 10),
                        });
                        selectClientById(createdClient.id);

                        return createdClient;
                    }}
                />

                <QuickCreateDialog<Product>
                    open={productCreateOpen}
                    onOpenChange={setProductCreateOpen}
                    title="Novo produto"
                    description="Cadastre um produto sem sair da venda."
                    fields={productQuickFields}
                    initialValues={{
                        cost: '0',
                        price: '0',
                        stock: '0',
                        minStock: '0',
                    }}
                    submitLabel="Salvar produto"
                    keepOpenAfterSubmit
                    onSubmit={async (values) => {
                        const createdProduct: Product = onCreateProduct({
                            id: crypto.randomUUID(),
                            name: String(values.name || '').trim(),
                            sku: String(values.sku || '').trim(),
                            price: Number(values.price || 0),
                            cost: Number(values.cost || 0),
                            stock: Number(values.stock || 0),
                            category: String(values.category || '').trim(),
                            brand: String(values.brand || '').trim(),
                            minStock: Number(values.minStock || 0),
                            createdAt:
                                values.createdAt ||
                                new Date().toISOString().slice(0, 10),
                        });
                        selectProductById(createdProduct.id);

                        return createdProduct;
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
