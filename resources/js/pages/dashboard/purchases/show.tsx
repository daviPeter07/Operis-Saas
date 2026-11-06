import { router } from '@inertiajs/react';
import { Ban, Pencil, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DetailsBackButton, DetailsHeader } from '@/components/details-page';
import { PageContent } from '@/components/page-content';
import { DeleteConfirmDialog } from '@/components/table/delete-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeletePurchase } from '@/hooks/use-purchases';
import AppLayout from '@/layouts/app-layout';
import { CreateEditModal } from './components/create-edit-modal';
import { PurchaseDetails } from './components/purchase-details';
import { PurchaseItems } from './components/purchase-items';
import { PurchasePayables } from './components/purchase-payables';
import { PurchaseStatusChip } from './components/purchase-status-chip';
import {
    CANCEL_PURCHASE_DIALOG,
    DELETE_PURCHASE_DIALOG,
    PURCHASE_MESSAGES,
    PURCHASES_LIST_URL,
} from './utils/constants';
import {
    getErrorMessage,
    getShowBreadcrumbs,
    goBackToPurchases,
    useCancelPurchase,
    usePurchase,
} from './utils/functions';
import type { PurchasesShowPageProps } from './utils/types';

export default function PurchasesShowPage({
    purchaseId,
}: PurchasesShowPageProps) {
    return (
        <AppLayout breadcrumbs={getShowBreadcrumbs(purchaseId)}>
            <PageContent>
                <ShowContent key={purchaseId} purchaseId={purchaseId} />
            </PageContent>
        </AppLayout>
    );
}

function ShowContent({ purchaseId }: PurchasesShowPageProps) {
    const { data: purchase, isPending, isError } = usePurchase(purchaseId);
    const deletePurchase = useDeletePurchase();
    const cancelPurchase = useCancelPurchase();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const backButton = (
        <DetailsBackButton
            label="Voltar para as compras"
            onClick={goBackToPurchases}
        />
    );

    if (isPending) {
        return (
            <div className="space-y-6">
                {backButton}
                <Skeleton className="h-8 w-72" />
                <Skeleton className="h-40" />
                <Skeleton className="h-48" />
                <Skeleton className="h-32" />
            </div>
        );
    }

    if (isError || !purchase) {
        return (
            <div className="space-y-6">
                {backButton}
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
                    <ShoppingBag className="size-10 text-muted-foreground" />
                    <p className="text-lg font-semibold">
                        Compra não encontrada
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Ela pode ter sido excluída ou pertencer a outra empresa.
                        Volte para as compras e escolha outra.
                    </p>
                </div>
            </div>
        );
    }

    const payables = purchase.payables ?? [];
    const isCancelled = purchase.status === 'cancelled';

    return (
        <div className="space-y-6">
            {backButton}

            <DetailsHeader
                title={`Detalhes da compra #${purchase.id}`}
                status={<PurchaseStatusChip status={purchase.status} />}
                actions={
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            className="gap-2"
                            disabled={isCancelled}
                            title={
                                isCancelled
                                    ? 'Compra cancelada não pode ser editada'
                                    : undefined
                            }
                            onClick={() => setIsEditOpen(true)}
                        >
                            <Pencil className="size-4" />
                            Editar
                        </Button>
                        {isCancelled ? null : (
                            <Button
                                variant="outline"
                                className="gap-2"
                                onClick={() => setIsCancelOpen(true)}
                            >
                                <Ban className="size-4" />
                                Cancelar compra
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            className="gap-2 text-red-600 hover:text-red-700 dark:text-red-400"
                            onClick={() => setIsDeleteOpen(true)}
                        >
                            <Trash2 className="size-4" />
                            Excluir
                        </Button>
                    </div>
                }
            />

            <PurchaseDetails purchase={purchase} />

            <PurchaseItems purchase={purchase} />

            {payables.length > 0 ? (
                <PurchasePayables payables={payables} />
            ) : null}

            {isCancelled ? null : (
                <CreateEditModal
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    purchase={purchase}
                />
            )}

            <DeleteConfirmDialog
                open={isCancelOpen}
                onOpenChange={setIsCancelOpen}
                {...CANCEL_PURCHASE_DIALOG}
                itemName={`Compra #${purchase.id}`}
                onConfirm={async () => {
                    try {
                        await cancelPurchase.mutateAsync(purchase.id);
                        toast.success(PURCHASE_MESSAGES.cancelSuccess);
                    } catch (error) {
                        toast.error(
                            getErrorMessage(
                                error,
                                PURCHASE_MESSAGES.cancelError,
                            ),
                        );
                    }
                }}
            />

            <DeleteConfirmDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                {...DELETE_PURCHASE_DIALOG}
                itemName={`Compra #${purchase.id}`}
                onConfirm={async () => {
                    try {
                        await deletePurchase.mutateAsync(purchase.id);
                        toast.success(PURCHASE_MESSAGES.deleteSuccess);
                        router.visit(PURCHASES_LIST_URL);
                    } catch (error) {
                        toast.error(
                            getErrorMessage(
                                error,
                                PURCHASE_MESSAGES.deleteError,
                            ),
                        );
                    }
                }}
            />
        </div>
    );
}
