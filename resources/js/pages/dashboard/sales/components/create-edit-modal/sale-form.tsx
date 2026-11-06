import { useState } from 'react';
import { toast } from 'sonner';
import { CatalogPanel } from '@/components/sales-dialog/catalog-panel';
import { useCreateProduct } from '@/hooks/use-products';
import { CreateEditModal as ClientCreateEditModal } from '@/pages/dashboard/clients/components/create-edit-modal';
import { CreateEditModal as ProductCreateEditModal } from '@/pages/dashboard/inventory/components/create-edit-modal';
import type { UiProduct } from '@/types/dashboard-entities';
import {
    buildSaleDraft,
    filterProductsByQuery,
    toNewClientData,
    useSaleForm,
} from '../../utils/functions';
import type { SaleDraft, SaleFormProps } from '../../utils/types';
import { AddProductDialog } from './add-product-dialog';
import { CheckoutPanel } from './checkout-panel';
import { DiscountDialog } from './discount-dialog';
import { SaleConfirmationDialog } from './sale-confirmation-dialog';

export function SaleForm({
    title,
    description,
    initial,
    saleId,
    saleStatus,
    customers,
    clients,
    products,
    paidInstallments,
    isSubmitting,
    onSubmit,
}: SaleFormProps) {
    const form = useSaleForm(initial, clients);
    const createProduct = useCreateProduct();
    const [isDiscountOpen, setIsDiscountOpen] = useState(false);
    const [discountKey, setDiscountKey] = useState(0);
    const [catalogProduct, setCatalogProduct] = useState<UiProduct | null>(
        null,
    );
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [addProductKey, setAddProductKey] = useState(0);
    const [isProductCreateOpen, setIsProductCreateOpen] = useState(false);
    const [newClientName, setNewClientName] = useState<string | null>(null);
    const [isClientEditOpen, setIsClientEditOpen] = useState(false);
    const [draft, setDraft] = useState<SaleDraft | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [draftKey, setDraftKey] = useState(0);

    const selectedCustomer = customers.find(
        (customer) => String(customer.id) === form.clientId,
    );

    return (
        <>
            <div className="grid max-h-[calc(100dvh-1rem)] min-h-[calc(100dvh-1rem)] grid-cols-1 lg:h-[min(90dvh,calc(100dvh-1rem))] lg:grid-cols-[1.35fr_0.65fr]">
                <CatalogPanel
                    productSearch={form.productSearch}
                    setProductSearch={form.setProductSearch}
                    isScannerReady={form.isScannerReady}
                    onToggleScanner={form.toggleScanner}
                    onOpenCreateProduct={() => setIsProductCreateOpen(true)}
                    visibleProducts={filterProductsByQuery(
                        products,
                        form.productSearch,
                    )}
                    onAddFromCatalog={(product) => {
                        setCatalogProduct(product);
                        setAddProductKey((key) => key + 1);
                        setIsAddProductOpen(true);
                    }}
                />

                <CheckoutPanel
                    form={form}
                    title={title}
                    description={description}
                    clientOptions={clients.map((client) => ({
                        value: client.id,
                        label: client.name,
                    }))}
                    onCreateClient={(name) => setNewClientName(name)}
                    onEditClient={() => setIsClientEditOpen(true)}
                    onOpenDiscount={() => {
                        setDiscountKey((key) => key + 1);
                        setIsDiscountOpen(true);
                    }}
                    onSubmit={() => {
                        setDraft(
                            buildSaleDraft(form, {
                                saleId,
                                saleStatus,
                                paidInstallments,
                                delivered: initial.delivered,
                            }),
                        );
                        setDraftKey((key) => key + 1);
                        setIsConfirmOpen(true);
                    }}
                />
            </div>

            <DiscountDialog
                key={`discount-${discountKey}`}
                open={isDiscountOpen}
                onOpenChange={setIsDiscountOpen}
                subtotal={form.subtotal}
                applied={form.discount}
                onApply={(discount) => {
                    form.setDiscount(discount);
                    setIsDiscountOpen(false);
                }}
            />

            <AddProductDialog
                key={`product-${addProductKey}`}
                open={isAddProductOpen}
                onOpenChange={setIsAddProductOpen}
                product={catalogProduct}
                onConfirm={(product, quantity, price) => {
                    form.addProduct(product, quantity, price);
                    setIsAddProductOpen(false);
                }}
            />

            <ClientCreateEditModal
                open={newClientName !== null}
                onOpenChange={(open) => !open && setNewClientName(null)}
                initialData={toNewClientData(newClientName ?? '')}
                onSuccess={(client) => form.setClientId(String(client.id))}
            />

            <ClientCreateEditModal
                open={isClientEditOpen}
                onOpenChange={setIsClientEditOpen}
                customer={selectedCustomer}
                onSuccess={(client) => form.setClientId(String(client.id))}
            />

            <ProductCreateEditModal
                open={isProductCreateOpen}
                onOpenChange={setIsProductCreateOpen}
                onSubmit={async (values) => {
                    const product = await createProduct.mutateAsync(values);
                    toast.success('Produto criado com sucesso.');
                    form.setProductSearch(product.name);
                }}
            />

            {draft ? (
                <SaleConfirmationDialog
                    key={`draft-${draftKey}`}
                    open={isConfirmOpen}
                    onOpenChange={setIsConfirmOpen}
                    draft={draft}
                    isSubmitting={isSubmitting}
                    onConfirm={onSubmit}
                />
            ) : null}
        </>
    );
}
