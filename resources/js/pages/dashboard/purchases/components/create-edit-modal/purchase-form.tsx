import { useState } from 'react';
import { toast } from 'sonner';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCreateProduct } from '@/hooks/use-products';
import { formatCurrencyBR } from '@/lib/format';
import { CreateEditModal as ProductCreateEditModal } from '@/pages/dashboard/inventory/components/create-edit-modal';
import { CreateEditModal as SupplierCreateEditModal } from '@/pages/dashboard/suppliers/components/create-edit-modal';
import type { UiProduct } from '@/types/dashboard-entities';
import { PURCHASE_MESSAGES } from '../../utils/constants';
import {
    buildPurchaseDraft,
    getReachableStep,
    usePurchaseForm,
} from '../../utils/functions';
import type {
    AddedToCart,
    PurchaseDraft,
    PurchaseFormProps,
} from '../../utils/types';
import { AddProductDialog } from './add-product-dialog';
import { CartStep } from './cart-step';
import { PaymentStep } from './payment-step';
import { ProductsStep } from './products-step';
import { PurchaseSteps } from './purchase-steps';
import { StepFooter } from './step-footer';
import { SummaryStep } from './summary-step';

export function PurchaseForm({
    title,
    description,
    initial,
    purchaseId,
    purchaseStatus,
    paidBoletos: initialPaidBoletos,
    suppliers,
    products,
    isSubmitting,
    onCancel,
    onSubmit,
}: PurchaseFormProps) {
    const form = usePurchaseForm(initial, suppliers);
    const createProduct = useCreateProduct();
    const [step, setStep] = useState(0);
    const [catalogProduct, setCatalogProduct] = useState<UiProduct | null>(
        null,
    );
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [lastAdded, setLastAdded] = useState<AddedToCart | null>(null);
    const [addProductKey, setAddProductKey] = useState(0);
    const [isProductCreateOpen, setIsProductCreateOpen] = useState(false);
    const [newSupplierName, setNewSupplierName] = useState<string | null>(null);
    const [status, setStatus] = useState<PurchaseDraft['status']>(
        purchaseStatus === 'completed' ? 'completed' : 'pending',
    );

    const [paidBoletos, setPaidBoletos] = useState(initialPaidBoletos);

    const reachable = getReachableStep(form);
    const draft = buildPurchaseDraft(form, {
        purchaseId,
        status,
        paidBoletos,
    });
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
                    <PurchaseSteps
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
                            lastAdded={lastAdded}
                            onViewCart={() => goTo(1)}
                            onDismissAdded={() => setLastAdded(null)}
                            onOpenCreateProduct={() =>
                                setIsProductCreateOpen(true)
                            }
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
                            supplierOptions={suppliers.map((supplier) => ({
                                value: String(supplier.id),
                                label: supplier.name,
                            }))}
                            onCreateSupplier={(name) =>
                                setNewSupplierName(name)
                            }
                        />
                    ) : null}

                    {step === 2 ? <PaymentStep form={form} /> : null}

                    {step === 3 ? (
                        <SummaryStep
                            draft={draft}
                            status={draft.status}
                            onStatusChange={setStatus}
                            onPaidBoletosChange={setPaidBoletos}
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
                    onConfirm={() => onSubmit(draft)}
                />
            </div>

            <AddProductDialog
                key={`product-${addProductKey}`}
                open={isAddProductOpen}
                onOpenChange={setIsAddProductOpen}
                product={catalogProduct}
                onConfirm={(product, quantity, cost) => {
                    form.addProduct(product, quantity, cost);
                    setLastAdded({
                        id: Date.now(),
                        productName: product.name,
                        quantity,
                    });
                    setIsAddProductOpen(false);
                }}
            />

            <SupplierCreateEditModal
                open={newSupplierName !== null}
                onOpenChange={(open) => !open && setNewSupplierName(null)}
                initialName={newSupplierName ?? ''}
                onSuccess={(supplier) =>
                    form.setSupplierId(String(supplier.id))
                }
            />

            <ProductCreateEditModal
                open={isProductCreateOpen}
                onOpenChange={setIsProductCreateOpen}
                onSubmit={async (values) => {
                    const product = await createProduct.mutateAsync(values);
                    toast.success(PURCHASE_MESSAGES.productCreated);
                    form.setProductSearch(product.name);
                }}
            />
        </>
    );
}
