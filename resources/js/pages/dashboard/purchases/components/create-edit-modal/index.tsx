import { toast } from 'sonner';
import { keepDialogOpenWhileSearchListOpen } from '@/components/input-search-complete';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useProducts } from '@/hooks/use-products';
import { useCreatePurchase, useUpdatePurchase } from '@/hooks/use-purchases';
import { useSuppliers } from '@/hooks/use-suppliers';
import { PURCHASE_DIALOG_TEXT } from '../../utils/constants';
import {
    getErrorMessage,
    getPaidBoletos,
    toPurchaseFormInitial,
    toPurchaseMutationInput,
    toUiProduct,
} from '../../utils/functions';
import type { CreateEditModalProps, PurchaseDraft } from '../../utils/types';
import { PurchaseForm } from './purchase-form';

export function CreateEditModal({
    open,
    onOpenChange,
    purchase,
}: CreateEditModalProps) {
    const { data: suppliers = [] } = useSuppliers();
    const { data: products = [] } = useProducts();
    const createPurchase = useCreatePurchase();
    const updatePurchase = useUpdatePurchase();

    const text = PURCHASE_DIALOG_TEXT[purchase ? 'edit' : 'create'];
    const isSubmitting = createPurchase.isPending || updatePurchase.isPending;

    const submit = async (draft: PurchaseDraft) => {
        const payload = toPurchaseMutationInput(draft);

        try {
            if (purchase) {
                await updatePurchase.mutateAsync({
                    id: purchase.id,
                    data: payload,
                });
            } else {
                await createPurchase.mutateAsync(payload);
            }

            toast.success(text.success);
            onOpenChange(false);
        } catch (error) {
            toast.error(getErrorMessage(error, text.error));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-[min(1400px,calc(100vw-1rem))] gap-0 overflow-hidden p-0 sm:max-w-[min(1400px,calc(100vw-1rem))]"
                onEscapeKeyDown={keepDialogOpenWhileSearchListOpen}
            >
                {/* A fresh form each time the dialog opens. */}
                <PurchaseForm
                    key={open ? `open-${purchase?.id ?? 'new'}` : 'closed'}
                    title={
                        purchase ? `${text.title} #${purchase.id}` : text.title
                    }
                    description={text.description}
                    initial={toPurchaseFormInitial(purchase)}
                    purchaseId={purchase?.id}
                    purchaseStatus={purchase?.status}
                    paidBoletos={getPaidBoletos(purchase)}
                    suppliers={suppliers}
                    products={products.map(toUiProduct)}
                    isSubmitting={isSubmitting}
                    onCancel={() => onOpenChange(false)}
                    onSubmit={(draft) => void submit(draft)}
                />
            </DialogContent>
        </Dialog>
    );
}
