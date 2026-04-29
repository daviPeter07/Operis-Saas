import * as React from 'react';
import {
    Barcode,
    CircleDollarSign,
    Package,
    Plus,
    Trash2,
    UserPlus,
    Wallet,
} from 'lucide-react';
import type { Client, Product, Sale } from '@/lib/mocks/mock-data';
import { formatCurrencyBR } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { SalesLineItem, SalesRecord } from '@/types/sales-dialog';
import { useSalesDialog } from '@/hooks/use-sales-dialog';
import { paymentMethodOptions, salesStatusOptions } from '@/utils/sales-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
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

interface SalesClientSectionProps {
    clients: Client[];
    clientId: string;
    clientSearch: string;
    selectedClientName?: string;
    onSelectClient: (id: string) => void;
    onClientSearchChange: (value: string) => void;
    onCreateClientClick: () => void;
}

interface SalesProductSectionProps {
    products: Product[];
    productId: string;
    productSearch: string;
    quantity: string;
    isScannerReady: boolean;
    canAddProduct: boolean;
    onSelectProduct: (id: string) => void;
    onProductSearchChange: (value: string) => void;
    onQuantityChange: (value: string) => void;
    onToggleScanner: () => void;
    onAddSelectedProduct: () => void;
    onCreateProductClick: () => void;
}

interface SalesItemsSectionProps {
    lineItems: SalesLineItem[];
    onLineItemQuantityChange: (itemId: string, value: string) => void;
    onRemoveLineItem: (itemId: string) => void;
}

interface SalesDetailsSectionProps {
    status: Sale['status'];
    paymentMethod: Sale['paymentMethod'];
    saleDate: string;
    notes: string;
    onStatusChange: (value: Sale['status']) => void;
    onPaymentMethodChange: (value: Sale['paymentMethod']) => void;
    onSaleDateChange: (value: string) => void;
    onNotesChange: (value: string) => void;
}

interface SalesSummaryPanelProps {
    selectedClientName?: string;
    itemsCount: number;
    lineItemsCount: number;
    estimatedProfit: number;
    total: number;
    canSubmit: boolean;
    onCancel: () => void;
    onSubmit: () => void;
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
        canSubmit,
        clientCreateOpen,
        clientId,
        clientQuickFields,
        clientSearch,
        estimatedProfit,
        itemsCount,
        isScannerReady,
        lineItems,
        notes,
        paymentMethod,
        productCreateOpen,
        productId,
        productQuickFields,
        productSearch,
        quantity,
        saleDate,
        selectedClient,
        selectedProduct,
        status,
        total,
        removeLineItem,
        selectClientById,
        selectProductById,
        setClientCreateOpen,
        setClientSearch,
        setIsScannerReady,
        setNotes,
        setPaymentMethod,
        setProductCreateOpen,
        setProductSearch,
        setQuantity,
        setSaleDate,
        setStatus,
        updateLineItemQuantity,
    } = useSalesDialog({ open, clients, products });

    const handleSubmit = () => {
        if (!selectedClient || lineItems.length === 0) {
            return;
        }

        onSubmit({
            id: crypto.randomUUID(),
            clientId: selectedClient.id,
            clientName: selectedClient.name,
            total,
            status,
            paymentMethod,
            items: itemsCount,
            createdAt: saleDate,
            lineItems,
            notes,
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[min(1440px,calc(100vw-1rem))] p-0 sm:max-w-[min(1440px,calc(100vw-1rem))]">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        handleSubmit();
                    }}
                    className="grid max-h-[92vh] overflow-hidden lg:grid-cols-[1.18fr_0.82fr]"
                >
                    <div className="flex min-h-0 flex-col overflow-y-auto">
                        <div className="border-b bg-linear-to-r from-primary/8 via-background to-background px-6 py-5">
                            <DialogHeader className="text-left">
                                <DialogTitle className="flex flex-wrap items-center gap-3 text-2xl">
                                    Nova venda
                                    <Badge variant="secondary">
                                        Fluxo rapido
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription>
                                    Registre o pedido, adicione produtos e monte
                                    o carrinho sem sair da tela.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="grid gap-5 p-6 xl:grid-cols-2">
                            <SalesClientSection
                                clients={clients}
                                clientId={clientId}
                                clientSearch={clientSearch}
                                selectedClientName={selectedClient?.name}
                                onSelectClient={selectClientById}
                                onClientSearchChange={setClientSearch}
                                onCreateClientClick={() =>
                                    setClientCreateOpen(true)
                                }
                            />

                            <SalesProductSection
                                products={products}
                                productId={productId}
                                productSearch={productSearch}
                                quantity={quantity}
                                isScannerReady={isScannerReady}
                                canAddProduct={Boolean(selectedProduct)}
                                onSelectProduct={selectProductById}
                                onProductSearchChange={setProductSearch}
                                onQuantityChange={setQuantity}
                                onToggleScanner={() =>
                                    setIsScannerReady((current) => !current)
                                }
                                onAddSelectedProduct={addSelectedProduct}
                                onCreateProductClick={() =>
                                    setProductCreateOpen(true)
                                }
                            />

                            <SalesItemsSection
                                lineItems={lineItems}
                                onLineItemQuantityChange={
                                    updateLineItemQuantity
                                }
                                onRemoveLineItem={removeLineItem}
                            />

                            <SalesDetailsSection
                                status={status}
                                paymentMethod={paymentMethod}
                                saleDate={saleDate}
                                notes={notes}
                                onStatusChange={setStatus}
                                onPaymentMethodChange={setPaymentMethod}
                                onSaleDateChange={setSaleDate}
                                onNotesChange={setNotes}
                            />
                        </div>
                    </div>

                    <SalesSummaryPanel
                        selectedClientName={selectedClient?.name}
                        itemsCount={itemsCount}
                        lineItemsCount={lineItems.length}
                        estimatedProfit={estimatedProfit}
                        total={total}
                        onCancel={() => onOpenChange(false)}
                        onSubmit={handleSubmit}
                        canSubmit={canSubmit}
                    />
                </form>

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
                    description="Cadastre um produto e continue adicionando itens no carrinho."
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
                        setIsScannerReady(true);
                        return createdProduct;
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}

function SalesClientSection({
    clients,
    clientId,
    clientSearch,
    selectedClientName,
    onSelectClient,
    onClientSearchChange,
    onCreateClientClick,
}: SalesClientSectionProps) {
    const clientOptions = clients.map((client) => client.id);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Label>Selecione o cliente</Label>
                <Combobox
                    items={clientOptions}
                    value={clientId}
                    itemToStringValue={(item) => item}
                    itemToStringLabel={(item) =>
                        clients.find((client) => client.id === item)?.name || item
                    }
                    onValueChange={(value) => onSelectClient(value || '')}
                    inputValue={clientSearch}
                    onInputValueChange={onClientSearchChange}
                >
                    <ComboboxInput
                        className="w-full"
                        placeholder="Digite para buscar cliente"
                        showClear
                    />
                    <ComboboxContent>
                        <ComboboxEmpty>
                            Nenhum cliente encontrado.
                        </ComboboxEmpty>
                        <ComboboxList>
                            <ComboboxCollection>
                                {(clientIdOption) => (
                                    <ComboboxItem
                                        key={clientIdOption}
                                        value={clientIdOption}
                                    >
                                        {clients.find(
                                            (client) =>
                                                client.id === clientIdOption,
                                        )?.name || clientIdOption}
                                    </ComboboxItem>
                                )}
                            </ComboboxCollection>
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={onCreateClientClick}
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar cliente agora
                </Button>

                {selectedClientName ? (
                    <p className="text-xs text-muted-foreground">
                        Cliente selecionado: <strong>{selectedClientName}</strong>
                    </p>
                ) : null}
            </CardContent>
        </Card>
    );
}

function SalesProductSection({
    products,
    productId,
    productSearch,
    quantity,
    isScannerReady,
    canAddProduct,
    onSelectProduct,
    onProductSearchChange,
    onQuantityChange,
    onToggleScanner,
    onAddSelectedProduct,
    onCreateProductClick,
}: SalesProductSectionProps) {
    const productOptions = products.map((product) => product.id);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Label>Buscar produto</Label>
                <Combobox
                    items={productOptions}
                    value={productId}
                    itemToStringValue={(item) => item}
                    itemToStringLabel={(item) => {
                        const product = products.find((entry) => entry.id === item);
                        return product ? `${product.name} (${product.sku})` : item;
                    }}
                    onValueChange={(value) => onSelectProduct(value || '')}
                    inputValue={productSearch}
                    onInputValueChange={onProductSearchChange}
                >
                    <ComboboxInput
                        className="w-full"
                        placeholder="Nome, SKU ou codigo de barras"
                        showClear
                    />
                    <ComboboxContent>
                        <ComboboxEmpty>
                            Nenhum produto encontrado.
                        </ComboboxEmpty>
                        <ComboboxList>
                            <ComboboxCollection>
                                {(productIdOption) => (
                                    <ComboboxItem value={productIdOption}>
                                        <div className="flex w-full items-center justify-between gap-4">
                                            <span>
                                                {products.find(
                                                    (product) =>
                                                        product.id ===
                                                        productIdOption,
                                                )?.name || productIdOption}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {products.find(
                                                    (product) =>
                                                        product.id ===
                                                        productIdOption,
                                                )?.sku || '-'}
                                            </span>
                                        </div>
                                    </ComboboxItem>
                                )}
                            </ComboboxCollection>
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>

                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(event) =>
                            onQuantityChange(event.currentTarget.value)
                        }
                    />
                    <Button
                        type="button"
                        variant={isScannerReady ? 'default' : 'outline'}
                        onClick={onToggleScanner}
                    >
                        <Barcode className="mr-2 h-4 w-4" />
                        Scanner
                    </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <Button
                        type="button"
                        disabled={!canAddProduct}
                        onClick={onAddSelectedProduct}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCreateProductClick}
                    >
                        <Package className="mr-2 h-4 w-4" />
                        Criar produto
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function SalesItemsSection({
    lineItems,
    onLineItemQuantityChange,
    onRemoveLineItem,
}: SalesItemsSectionProps) {
    return (
        <Card className="xl:col-span-2">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Produtos adicionados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {lineItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Nenhum produto adicionado ainda.
                    </p>
                ) : (
                    lineItems.map((item) => (
                        <div
                            key={item.id}
                            className="grid items-center gap-3 rounded-lg border p-3 md:grid-cols-[1fr_auto_auto_auto]"
                        >
                            <div>
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-xs text-muted-foreground">
                                    SKU: {item.sku}
                                </p>
                            </div>
                            <Input
                                type="number"
                                min="1"
                                className="w-24"
                                value={String(item.quantity)}
                                onChange={(event) =>
                                    onLineItemQuantityChange(
                                        item.id,
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <Badge variant="outline">
                                {formatCurrencyBR(item.subtotal)}
                            </Badge>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemoveLineItem(item.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

function SalesDetailsSection({
    status,
    paymentMethod,
    saleDate,
    notes,
    onStatusChange,
    onPaymentMethodChange,
    onSaleDateChange,
    onNotesChange,
}: SalesDetailsSectionProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Detalhes da venda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={onStatusChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                            {salesStatusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Forma de pagamento</Label>
                    <Select
                        value={paymentMethod}
                        onValueChange={onPaymentMethodChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione a forma" />
                        </SelectTrigger>
                        <SelectContent>
                            {paymentMethodOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Data da venda</Label>
                    <Input
                        type="date"
                        value={saleDate}
                        onChange={(event) =>
                            onSaleDateChange(event.currentTarget.value)
                        }
                    />
                </div>

                <div className="space-y-2">
                    <Label>Observacoes</Label>
                    <Textarea
                        value={notes}
                        rows={4}
                        onChange={(event) =>
                            onNotesChange(event.currentTarget.value)
                        }
                        placeholder="Anotacoes opcionais desta venda"
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function SalesSummaryPanel({
    selectedClientName,
    itemsCount,
    lineItemsCount,
    estimatedProfit,
    total,
    canSubmit,
    onCancel,
    onSubmit,
}: SalesSummaryPanelProps) {
    return (
        <aside className="border-l bg-muted/20 p-6">
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold">Resumo da venda</h3>
                    <p className="text-sm text-muted-foreground">
                        Confira os dados antes de finalizar.
                    </p>
                </div>

                <Card>
                    <CardContent className="space-y-4 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                Cliente
                            </span>
                            <span className="text-sm font-medium">
                                {selectedClientName || 'Nao selecionado'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                Itens
                            </span>
                            <span className="text-sm font-medium">
                                {itemsCount} un. ({lineItemsCount} produtos)
                            </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center text-sm text-muted-foreground">
                                <CircleDollarSign className="mr-1 h-4 w-4" />
                                Lucro estimado
                            </span>
                            <span className="font-semibold">
                                {formatCurrencyBR(estimatedProfit)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2">
                            <span className="inline-flex items-center font-medium text-primary">
                                <Wallet className="mr-1 h-4 w-4" />
                                Total
                            </span>
                            <span className="text-lg font-bold text-primary">
                                {formatCurrencyBR(total)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-3">
                    <Button
                        type="submit"
                        className={cn(!canSubmit && 'pointer-events-none')}
                        disabled={!canSubmit}
                        onClick={onSubmit}
                    >
                        Finalizar venda
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                </div>
            </div>
        </aside>
    );
}
