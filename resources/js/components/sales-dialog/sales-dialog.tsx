import * as React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ClientCreateDialog } from '@/features/dashboard/clients/client-create-dialog';
import { ProductDialog } from '@/features/dashboard/inventory/product-dialog';
import { useSalesDialog } from '@/hooks/use-sales-dialog';
import type { UiProduct as Product } from '@/types/dashboard-entities';
import type { SalesRecord } from '@/types/sales-dialog';
import type { SalesDialogProps } from '@/types/sales-dialog-component';
import { inferPersonType } from '@/utils/clients';
import { applyFieldMask, parseCurrencyInput } from '@/utils/form-fields';
import { filterProductsByQuery } from '@/utils/sales-dialog';
import { CatalogPanel } from './catalog-panel';
import { CheckoutPanel } from './checkout-panel';
import { AddProductDialog, DiscountDialog } from './dialogs';
import SaleConfirmationDialog from './sale-confirmation-dialog';

export function SalesDialog({
    sale,
    open,
    onOpenChange,
    onSubmit,
    clients,
    products,
    brands,
    categories,
    onCreateProduct,
    onCreateBrand,
    onCreateCategory,
    defaultTab = 'catalog',
}: SalesDialogProps) {
    const {
        addProductToCart,
        applyDiscount,
        appliedDiscountType,
        appliedDiscountValue,
        canSubmit,
        clientCreateOpen,
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
        crediarioEntry,
        firstInstallmentDate,
        productCreateOpen,
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
        setCrediarioEntry,
        setFirstInstallmentDate,
        setProductCreateOpen,
        setProductSearch,
        setLineItems,
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
    const [catalogSalePrice, setCatalogSalePrice] = React.useState('R$ 0,00');
    const [catalogQuantity, setCatalogQuantity] = React.useState('1');
    const [showCostPrice, setShowCostPrice] = React.useState(false);
    const checkoutRef = React.useRef<HTMLDivElement>(null);
    const [confirmationOpen, setConfirmationOpen] = React.useState(false);
    const [saleDraft, setSaleDraft] = React.useState<SalesRecord | null>(null);
    const [clientLimitEditorOpen, setClientLimitEditorOpen] =
        React.useState(false);

    React.useEffect(() => {
        if (open && defaultTab === 'checkout' && checkoutRef.current) {
            checkoutRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [open, defaultTab]);

    /* eslint-disable react-hooks/exhaustive-deps */
    React.useEffect(() => {
        if (open && sale) {
            // Populate client
            selectClientById(String(sale.clientId));

            // Populate line items
            setLineItems(sale.lineItems ?? []);

            // Dates
            setSaleDate(sale.createdAt ?? saleDate);

            // Payment details
            setPaymentMethod(sale.paymentMethod);

            if (sale.paymentMethod === 'card') {
                setCardType(sale.cardType ?? 'debit');
                setInstallments(String(sale.installments ?? 1));
                setFirstInstallmentDate(
                    sale.firstInstallmentDate ?? firstInstallmentDate,
                );
            }

            if (sale.paymentMethod === 'crediario') {
                setCardType('credit');
                setInstallments(String(sale.installments ?? 1));
                setFirstInstallmentDate(
                    sale.firstInstallmentDate ?? firstInstallmentDate,
                );
                const entryAmount = Number(sale.crediarioEntry ?? 0);
                setCrediarioEntry(
                    entryAmount > 0
                        ? applyFieldMask(
                              String(Math.round(entryAmount * 100)),
                              'currency',
                          )
                        : '',
                );
            }

            // Notes
            setNotes(sale.notes ?? '');

            // Discount
            if (sale.discountType) {
                setDiscountType(sale.discountType);
                setDiscountValue(String(sale.discountValue ?? 0));

                // Apply discount to update totals
                applyDiscount();
            }
        }
    }, [open, sale]);
    /* eslint-enable react-hooks/exhaustive-deps */

    const visibleProducts = React.useMemo(
        () => filterProductsByQuery(products, productSearch),
        [products, productSearch],
    );
    const availableCredit = React.useMemo(() => {
        if (!selectedClient?.creditEnabled) {
            return 0;
        }

        return Number(selectedClient.availableCredit ?? 0);
    }, [selectedClient]);
    const crediarioEntryValue = Math.max(0, parseCurrencyInput(crediarioEntry));
    const financedTotal = Math.max(0, finalTotal - crediarioEntryValue);
    const maxCrediarioInstallments = React.useMemo(() => {
        const termDays = Number(selectedClient?.creditTermDays ?? 30);

        return Math.max(1, Math.floor(termDays / 30));
    }, [selectedClient]);

    React.useEffect(() => {
        if (paymentMethod !== 'crediario') {
            return;
        }

        const currentInstallments = Number(installments) || 1;

        if (currentInstallments > maxCrediarioInstallments) {
            setInstallments(String(maxCrediarioInstallments));
        }
    }, [
        installments,
        maxCrediarioInstallments,
        paymentMethod,
        setInstallments,
    ]);
    const crediarioExceeded =
        paymentMethod === 'crediario' && financedTotal > availableCredit;
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
        setCatalogSalePrice(applyFieldMask(String((product.price ?? 0) * 100), 'currency'));
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
            parseCurrencyInput(catalogSalePrice),
        );
        setAddProductDialogOpen(false);
    };

    const handleSubmit = () => {
        if (!selectedClient || lineItems.length === 0) {
            return;
        }

        if (crediarioExceeded) {
            return;
        }

        if (paymentMethod === 'crediario') {
            if (!(crediarioEntryValue > 0) || crediarioEntryValue >= finalTotal) {
                return;
            }
        }

        const effectiveInstallments =
            paymentMethod === 'crediario'
                ? Math.max(
                      1,
                      Math.min(
                          maxCrediarioInstallments,
                          Number(installments) || 1,
                      ),
                  )
                : 1;

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
            cardType:
                paymentMethod === 'card' || paymentMethod === 'crediario'
                    ? cardType
                    : undefined,
            installments:
                paymentMethod === 'crediario'
                    ? effectiveInstallments
                    : undefined,
            firstInstallmentDate:
                paymentMethod === 'crediario'
                    ? firstInstallmentDate
                    : undefined,
            installmentValue:
                paymentMethod === 'crediario'
                    ? Number(
                          (
                              financedTotal / effectiveInstallments
                          ).toFixed(2),
                      )
                    : undefined,
            availableCredit:
                paymentMethod === 'crediario' ? availableCredit : undefined,
            crediarioEntry:
                paymentMethod === 'crediario' ? crediarioEntryValue : undefined,
        };
        // open confirmation dialog instead of submitting immediately
        setSaleDraft(payload);
        setConfirmationOpen(true);
    };

    const handleConfirmAndSubmit = (
        confirmed: SalesRecord & { delivered?: boolean },
    ) => {
        // pass confirmed sale to parent submit handler
        onSubmit(confirmed);
        setConfirmationOpen(false);
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
                            crediarioEntry={crediarioEntry}
                            setCrediarioEntry={setCrediarioEntry}
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
                            availableCredit={availableCredit}
                            crediarioExceeded={crediarioExceeded}
                            maxCrediarioInstallments={maxCrediarioInstallments}
                            onOpenEditClient={() => setClientLimitEditorOpen(true)}
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

                <ClientCreateDialog
                    open={clientCreateOpen}
                    onOpenChange={setClientCreateOpen}
                    onSuccess={(client) => {
                        selectClientById(String(client.id));
                    }}
                />

                <ClientCreateDialog
                    open={clientLimitEditorOpen}
                    onOpenChange={setClientLimitEditorOpen}
                    initialData={
                        selectedClient
                            ? {
                                  id: Number(selectedClient.id),
                                  name: selectedClient.name,
                                  email: selectedClient.email,
                                  phone: selectedClient.phone,
                                  document: selectedClient.document,
                                  personType: inferPersonType(
                                      selectedClient.document,
                                  ),
                                  creditEnabled: Boolean(
                                      selectedClient.creditEnabled,
                                  ),
                                  creditLimit: Number(
                                      selectedClient.creditLimit ?? 0,
                                  ),
                                  creditTermDays: Number(
                                      selectedClient.creditTermDays ?? 30,
                                  ),
                                  status: 'active',
                              }
                            : undefined
                    }
                    onSuccess={({ id }) => {
                        selectClientById(String(id));
                    }}
                />

                <ProductDialog
                    open={productCreateOpen}
                    onOpenChange={setProductCreateOpen}
                    mode="create"
                    brands={brands}
                    categories={categories}
                    onCreateBrand={onCreateBrand}
                    onCreateCategory={onCreateCategory}
                    onSubmit={async (values) => {
                        const createdProduct: Product =
                            await onCreateProduct(values);
                        selectProductById(createdProduct.id);
                    }}
                />
                <SaleConfirmationDialog
                    open={confirmationOpen}
                    onOpenChange={setConfirmationOpen}
                    saleDraft={saleDraft}
                    onConfirm={handleConfirmAndSubmit}
                />
            </DialogContent>
        </Dialog>
    );
}
