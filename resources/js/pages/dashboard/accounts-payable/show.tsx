import { router } from '@inertiajs/react';
import { CircleCheck, Pencil, ReceiptText, Trash2, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DetailsBackButton, DetailsHeader } from '@/components/details-page';
import { PageContent } from '@/components/page-content';
import { DeleteConfirmDialog } from '@/components/table/delete-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteAccountPayable } from '@/hooks/use-account-payables';
import AppLayout from '@/layouts/app-layout';
import { CreateEditModal } from './components/create-edit-modal';
import { PartialSettleDialog } from './components/partial-settle-dialog';
import { PayableDetails } from './components/payable-details';
import { PayableStatusChip } from './components/payable-status-chip';
import {
    DELETE_PAYABLE_DIALOG,
    PAYABLE_MESSAGES,
    PAYABLES_LIST_URL,
    SETTLE_LABELS,
} from './utils/constants';
import {
    getErrorMessage,
    getShowBreadcrumbs,
    goBackToPayables,
    isOpenStatus,
    toPayableRow,
    usePaymentActions,
    usePayable,
} from './utils/functions';
import type { PayablesShowPageProps } from './utils/types';

export default function AccountsPayableShowPage({
    payableId,
}: PayablesShowPageProps) {
    return (
        <AppLayout breadcrumbs={getShowBreadcrumbs(payableId)}>
            <PageContent>
                <ShowContent key={payableId} payableId={payableId} />
            </PageContent>
        </AppLayout>
    );
}

function ShowContent({ payableId }: PayablesShowPageProps) {
    const { data: payable, isPending, isError } = usePayable(payableId);
    const deletePayable = useDeleteAccountPayable();
    const actions = usePaymentActions();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPartialOpen, setIsPartialOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const backButton = (
        <DetailsBackButton
            label="Voltar para contas a pagar"
            onClick={goBackToPayables}
        />
    );

    if (isPending) {
        return (
            <div className="space-y-6">
                {backButton}
                <Skeleton className="h-8 w-72" />
                <Skeleton className="h-40" />
                <Skeleton className="h-32" />
            </div>
        );
    }

    if (isError || !payable) {
        return (
            <div className="space-y-6">
                {backButton}
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
                    <ReceiptText className="size-10 text-muted-foreground" />
                    <p className="text-lg font-semibold">
                        Conta não encontrada
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Ela pode ter sido excluída ou pertencer a outra empresa.
                        Volte para contas a pagar e escolha outra.
                    </p>
                </div>
            </div>
        );
    }

    const isOpen = isOpenStatus(payable.status);
    const isSettled = payable.status === 'paid';

    return (
        <div className="space-y-6">
            {backButton}

            <DetailsHeader
                title={`Detalhes da conta #${payable.id}`}
                status={<PayableStatusChip status={payable.status} />}
                actions={
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                        {isOpen ? (
                            <>
                                <Button
                                    className="gap-2"
                                    disabled={actions.isProcessing}
                                    onClick={() =>
                                        void actions.settle([payable.id])
                                    }
                                >
                                    <CircleCheck className="size-4" />
                                    {SETTLE_LABELS.settle}
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={actions.isProcessing}
                                    onClick={() => setIsPartialOpen(true)}
                                >
                                    {SETTLE_LABELS.partial}
                                </Button>
                            </>
                        ) : null}
                        {isSettled ? (
                            <Button
                                variant="outline"
                                className="gap-2"
                                disabled={actions.isProcessing}
                                onClick={() => void actions.undo([payable.id])}
                            >
                                <Undo2 className="size-4" />
                                {SETTLE_LABELS.undo}
                            </Button>
                        ) : null}
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => setIsEditOpen(true)}
                        >
                            <Pencil className="size-4" />
                            Editar
                        </Button>
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

            <PayableDetails payable={payable} />

            <CreateEditModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                payable={payable}
            />

            <PartialSettleDialog
                key={isPartialOpen ? 'open' : 'closed'}
                open={isPartialOpen}
                onOpenChange={setIsPartialOpen}
                row={toPayableRow(payable)}
                isSubmitting={actions.isProcessing}
                onConfirm={(amount) =>
                    void actions
                        .partial(payable.id, amount)
                        .then((done) => done && setIsPartialOpen(false))
                }
            />

            <DeleteConfirmDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                {...DELETE_PAYABLE_DIALOG}
                itemName={payable.item ?? `Conta #${payable.id}`}
                onConfirm={async () => {
                    try {
                        await deletePayable.mutateAsync(payable.id);
                        toast.success(PAYABLE_MESSAGES.deleteSuccess);
                        router.visit(PAYABLES_LIST_URL);
                    } catch (error) {
                        toast.error(
                            getErrorMessage(
                                error,
                                PAYABLE_MESSAGES.deleteError,
                            ),
                        );
                    }
                }}
            />
        </div>
    );
}
