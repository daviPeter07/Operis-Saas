import { useState } from 'react';
import { toast } from 'sonner';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCreateProduct } from '@/hooks/use-products';
import { formatCurrencyBR } from '@/lib/format';
import { CreateEditModal as ClientCreateEditModal } from '@/pages/dashboard/clients/components/create-edit-modal';
import { CreateEditModal as ProductCreateEditModal } from '@/pages/dashboard/inventory/components/create-edit-modal';
import { CreateEditModal as ServiceCreateEditModal } from '@/pages/dashboard/services/components/create-edit-modal';
import type { Service } from '@/schemas/service';
import type { UiProduct } from '@/types/dashboard-entities';
import {
    buildSaleDraft,
    getReachableStep,
    toNewClientData,
    toPreviewSale,
    useSaleForm,
} from '../../utils/functions';
import type {
    AddedToCart,
    CatalogMode,
    SaleDraft,
    SaleFormProps,
} from '../../utils/types';
import { PrintPreviewDialog } from '../print-preview-dialog';
import { AddProductDialog } from './add-product-dialog';
import { AddServiceDialog } from './add-service-dialog';
import { CartStep } from './cart-step';
import { DiscountDialog } from './discount-dialog';
import { PaymentStep } from './payment-step';
import { ProductsStep } from './products-step';
import { SaleSteps } from './sale-steps';
import { StepFooter } from './step-footer';
import { SummaryStep } from './summary-step';

export function SaleForm({
    title,
    description,
    initial,
    saleId,
    saleStatus,
    savedInstallmentAmounts,
    customers,
    clients,
    products,
    services,
    paidInstallments: initialPaidInstallments,
    isSubmitting,
    onCancel,
    onSubmit,
}: SaleFormProps) {
    const form = useSaleForm(initial, clients);
    const createProduct = useCreateProduct();
    const [step, setStep] = useState(0);
    const [isDiscountOpen, setIsDiscountOpen] = useState(false);
    const [discountKey, setDiscountKey] = useState(0);
    const [catalogProduct, setCatalogProduct] = useState<UiProduct | null>(
        null,
    );
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [lastAdded, setLastAdded] = useState<AddedToCart | null>(null);
    const [addProductKey, setAddProductKey] = useState(0);
    const [isProductCreateOpen, setIsProductCreateOpen] = useState(false);
    const [catalogMode, setCatalogMode] = useState<CatalogMode>('products');
    const [serviceSearch, setServiceSearch] = useState('');
    const [catalogService, setCatalogService] = useState<Service | null>(null);
    const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
    const [addServiceKey, setAddServiceKey] = useState(0);
    const [isServiceCreateOpen, setIsServiceCreateOpen] = useState(false);
    const [newClientName, setNewClientName] = useState<string | null>(null);
    const [isClientEditOpen, setIsClientEditOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [status, setStatus] = useState<SaleDraft['status']>(
        saleStatus === 'completed' ? 'completed' : 'pending',
    );
    const [paidInstallments, setPaidInstallments] = useState(
        initialPaidInstallments,
    );

    const reachable = getReachableStep(form);
    const draft = buildSaleDraft(form, {
        saleId,
        saleStatus,
        paidInstallments,
        savedInstallmentAmounts,
        delivered: initial.delivered,
    });
    const isCrediario = draft.paymentMethod === 'crediario';
    const confirmed: SaleDraft = {
        ...draft,
        status: isCrediario ? 'pending' : status,
        paidInstallments: draft.paidInstallments,
    };

    const selectedCustomer = customers.find(
        (customer) => String(customer.id) === form.clientId,
    );
    const goTo = (index: number) =>
        setStep(Math.max(0, Math.min(index, reachable)));

    return (
        <>
            <div className="flex h-[min(92dvh,calc(100dvh-1rem))] min-w-0 flex-col">
                <div className="space-y-4 border-b px-4 pt-4 pb-3">
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-lg">{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    <SaleSteps
                        current={step}
                        reachable={reachable}
                        onSelect={goTo}
                    />
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                    {step === 0 ? (
                        <ProductsStep
                            form={form}
                            products={products}
                            services={services}
                            mode={catalogMode}
                            onModeChange={setCatalogMode}
                            serviceSearch={serviceSearch}
                            onServiceSearchChange={setServiceSearch}
                            lastAdded={lastAdded}
                            onViewCart={() => goTo(1)}
                            onDismissAdded={() => setLastAdded(null)}
                            onOpenCreateProduct={() =>
                                setIsProductCreateOpen(true)
                            }
                            onOpenCreateService={() =>
                                setIsServiceCreateOpen(true)
                            }
                            onAddService={(service) => {
                                setCatalogService(service);
                                setAddServiceKey((key) => key + 1);
                                setIsAddServiceOpen(true);
                            }}
                            onAddFromCatalog={(product) => {
                                setCatalogProduct(product);
                                setAddProductKey((key) => key + 1);
                                setIsAddProductOpen(true);
                            }}
                        />
                    ) : null}

                    {step === 1 ? (
                        <CartStep
                            form={form}
                            clientOptions={clients.map((client) => ({
                                value: client.id,
                                label: client.name,
                            }))}
                            onCreateClient={(name) => setNewClientName(name)}
                            onOpenDiscount={() => {
                                setDiscountKey((key) => key + 1);
                                setIsDiscountOpen(true);
                            }}
                        />
                    ) : null}

                    {step === 2 ? (
                        <PaymentStep
                            form={form}
                            onEditClient={() => setIsClientEditOpen(true)}
                        />
                    ) : null}

                    {step === 3 ? (
                        <SummaryStep
                            draft={draft}
                            status={confirmed.status}
                            onStatusChange={setStatus}
                            paidInstallments={draft.paidInstallments}
                            onPaidInstallmentsChange={setPaidInstallments}
                            onPrint={() => setIsPreviewOpen(true)}
                        />
                    ) : null}
                </div>

                <StepFooter
                    step={step}
                    canAdvance={step < reachable}
                    isSubmitting={isSubmitting}
                    summary={
                        form.lineItems.length > 0 ? (
                            <span className="text-muted-foreground">
                                {form.lineItems.length}{' '}
                                {form.lineItems.length === 1 ? 'item' : 'itens'}{' '}
                                ·{' '}
                                <span className="font-semibold text-foreground">
                                    {formatCurrencyBR(form.total)}
                                </span>
                            </span>
                        ) : null
                    }
                    onCancel={onCancel}
                    onBack={() => setStep((current) => current - 1)}
                    onNext={() => goTo(step + 1)}
                    onConfirm={() => onSubmit(confirmed)}
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
                    setLastAdded({
                        id: Date.now(),
                        productName: product.name,
                        quantity,
                    });
                    setIsAddProductOpen(false);
                }}
            />

            <AddServiceDialog
                key={`service-${addServiceKey}`}
                open={isAddServiceOpen}
                onOpenChange={setIsAddServiceOpen}
                service={catalogService}
                onConfirm={(service, quantity, price) => {
                    form.addService(service, quantity, price);
                    setLastAdded({
                        id: Date.now(),
                        productName: service.name,
                        quantity,
                    });
                    setIsAddServiceOpen(false);
                }}
            />

            <ServiceCreateEditModal
                open={isServiceCreateOpen}
                onOpenChange={setIsServiceCreateOpen}
                initialName={serviceSearch.trim()}
                onCreated={(service) => setServiceSearch(service.name)}
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

            <PrintPreviewDialog
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                sale={toPreviewSale(confirmed)}
                initialMode="thermal"
            />
        </>
    );
}
