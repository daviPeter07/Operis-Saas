import * as React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { QuickCreateDialog } from '@/features/dashboard/sales/quick-create-dialog';
import { useSalesDialog } from '@/hooks/use-sales-dialog';
import type { UiCustomer as Client, UiProduct as Product } from '@/types/dashboard-entities';
import type { SalesRecord } from '@/types/sales-dialog';
import type { SalesDialogProps } from '@/types/sales-dialog-component';
import { filterProductsByQuery } from '@/utils/sales-dialog';
import { CatalogPanel } from './catalog-panel';
import { CheckoutPanel } from './checkout-panel';
import { AddProductDialog, DiscountDialog } from './dialogs';

export function SalesDialog({
    open,
    onOpenChange,
    onSubmit,
    clients,
    products,
    onCreateClient,
    onCreateProduct,
    defaultTab = 'catalog',
}: SalesDialogProps) {
    const {
        addProductToCart,
        applyDiscount,
        appliedDiscountType,
        appliedDiscountValue,
        canSubmit,
        clientCreateOpen,
        clientQuickFields,
        clientSearch,
        decreaseLineItemQuantity,
        discountAmountApplied,
        discountType,
        discountValue,
        finalTotal,
        increaseLineItemQuantity,
        isScannerReady,
        lineItems,
        notes,
        paymentMethod,
        cardType,
        installments,
        firstInstallmentDate,
        productCreateOpen,
        productQuickFields,
        productSearch,
        removeLineItem,
        saleDate,
        selectClientById,
        selectProductById,
        selectedClient,
        setClientCreateOpen,
        setClientSearch,
        setDiscountType,
        setDiscountValue,
        setIsScannerReady,
        setNotes,
        setPaymentMethod,
        setCardType,
        setInstallments,
        setFirstInstallmentDate,
        setProductCreateOpen,
        setProductSearch,
        setSaleDate,
        total,
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
    const checkoutRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (open && defaultTab === 'checkout' && checkoutRef.current) {
            checkoutRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [open, defaultTab]);

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

        const payload: SalesRecord = {
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
            cardType: paymentMethod === 'card' ? cardType : undefined,
            installments:
                paymentMethod === 'card' && cardType === 'credit'
                    ? Math.max(1, Math.min(24, Number(installments) || 1))
                    : undefined,
            firstInstallmentDate:
                paymentMethod === 'card' && cardType === 'credit'
                    ? firstInstallmentDate
                    : undefined,
            installmentValue:
                paymentMethod === 'card' && cardType === 'credit'
                    ? Number(
                          (
                              finalTotal /
                              Math.max(
                                  1,
                                  Math.min(24, Number(installments) || 1),
                              )
                          ).toFixed(2),
                      )
                    : undefined,
        };
        onSubmit(payload);
        onOpenChange(false);
    };

    return (
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
                        onOpenCreateProduct={() => setProductCreateOpen(true)}
                        visibleProducts={visibleProducts}
                        onAddFromCatalog={handleAddFromCatalog}
                    />

                    <div ref={checkoutRef}>
                        <CheckoutPanel
                            clientSearch={clientSearch}
                            setClientSearch={setClientSearch}
                            filteredClients={filteredClients}
                            selectedClient={selectedClient}
                            selectClientById={selectClientById}
                            openCreateClient={() => setClientCreateOpen(true)}
                            lineItems={lineItems}
                            increaseLineItemQuantity={increaseLineItemQuantity}
                            decreaseLineItemQuantity={decreaseLineItemQuantity}
                            removeLineItem={removeLineItem}
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            cardType={cardType}
                            setCardType={setCardType}
                            installments={installments}
                            setInstallments={setInstallments}
                            firstInstallmentDate={firstInstallmentDate}
                            setFirstInstallmentDate={setFirstInstallmentDate}
                            total={total}
                            discountAmountApplied={discountAmountApplied}
                            finalTotal={finalTotal}
                            openDiscountDialog={() =>
                                setDiscountDialogOpen(true)
                            }
                            notes={notes}
                            setNotes={setNotes}
                            saleDate={saleDate}
                            calendarOpen={calendarOpen}
                            setCalendarOpen={setCalendarOpen}
                            setSaleDate={setSaleDate}
                            canSubmit={canSubmit}
                            onSubmit={handleSubmit}
                        />
                    </div>
                </div>

                <DiscountDialog
                    open={discountDialogOpen}
                    onOpenChange={setDiscountDialogOpen}
                    discountType={discountType}
                    setDiscountType={setDiscountType}
                    discountValue={discountValue}
                    setDiscountValue={setDiscountValue}
                    onApply={() => {
                        applyDiscount();
                        setDiscountDialogOpen(false);
                    }}
                />

                <AddProductDialog
                    open={addProductDialogOpen}
                    onOpenChange={setAddProductDialogOpen}
                    catalogProduct={catalogProduct}
                    catalogSalePrice={catalogSalePrice}
                    setCatalogSalePrice={setCatalogSalePrice}
                    catalogQuantity={catalogQuantity}
                    setCatalogQuantity={setCatalogQuantity}
                    showCostPrice={showCostPrice}
                    setShowCostPrice={setShowCostPrice}
                    onConfirm={confirmAddProductFromCatalog}
                />

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
                        cost: 'R$ 0,00',
                        price: 'R$ 0,00',
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
