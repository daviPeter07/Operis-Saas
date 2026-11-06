import { router } from '@inertiajs/react';
import { CircleCheck, Pencil, ReceiptText, Trash2, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DetailsBackButton, DetailsHeader } from '@/components/details-page';
import { PageContent } from '@/components/page-content';
import { DeleteConfirmDialog } from '@/components/table/delete-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteAccountReceivable } from '@/hooks/use-account-receivables';
import AppLayout from '@/layouts/app-layout';
import { CreateEditModal } from './components/create-edit-modal';
import { PartialSettleDialog } from './components/partial-settle-dialog';
import { ReceivableDetails } from './components/receivable-details';
import { ReceivableStatusChip } from './components/receivable-status-chip';
import {
    DELETE_RECEIVABLE_DIALOG,
    RECEIVABLE_MESSAGES,
    RECEIVABLES_LIST_URL,
    SETTLE_LABELS,
} from './utils/constants';
import {
    getErrorMessage,
    getShowBreadcrumbs,
    goBackToReceivables,
    isOpenStatus,
    toReceivableRow,
    useReceiptActions,
    useReceivable,
} from './utils/functions';
import type { ReceivablesShowPageProps } from './utils/types';

export default function AccountsReceivableShowPage({
    receivableId,
}: ReceivablesShowPageProps) {
    return (
        <AppLayout breadcrumbs={getShowBreadcrumbs(receivableId)}>
            <PageContent>
                <ShowContent key={receivableId} receivableId={receivableId} />
            </PageContent>
        </AppLayout>
    );
}

function ShowContent({ receivableId }: ReceivablesShowPageProps) {
    const {
        data: receivable,
        isPending,
        isError,
    } = useReceivable(receivableId);
    const deleteReceivable = useDeleteAccountReceivable();
    const actions = useReceiptActions();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPartialOpen, setIsPartialOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const backButton = (
        <DetailsBackButton
            label="Voltar para contas a receber"
            onClick={goBackToReceivables}
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

    if (isError || !receivable) {
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
                        Volte para contas a receber e escolha outra.
                    </p>
                </div>
            </div>
        );
    }

    const isOpen = isOpenStatus(receivable.status);
    const isSettled = receivable.status === 'received';

    return (
        <div className="space-y-6">
            {backButton}

            <DetailsHeader
                title={`Detalhes da conta #${receivable.id}`}
                status={<ReceivableStatusChip status={receivable.status} />}
                actions={
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                        {isOpen ? (
                            <>
                                <Button
                                    className="gap-2"
                                    disabled={actions.isProcessing}
                                    onClick={() =>
                                        void actions.settle([receivable.id])
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
                                onClick={() =>
                                    void actions.undo([receivable.id])
                                }
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

            <ReceivableDetails receivable={receivable} />

            <CreateEditModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                receivable={receivable}
            />

            <PartialSettleDialog
                key={isPartialOpen ? 'open' : 'closed'}
                open={isPartialOpen}
                onOpenChange={setIsPartialOpen}
                row={toReceivableRow(receivable)}
                isSubmitting={actions.isProcessing}
                onConfirm={(amount) =>
                    void actions
                        .partial(receivable.id, amount)
                        .then((done) => done && setIsPartialOpen(false))
                }
            />

            <DeleteConfirmDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                {...DELETE_RECEIVABLE_DIALOG}
                itemName={receivable.item ?? `Conta #${receivable.id}`}
                onConfirm={async () => {
                    try {
                        await deleteReceivable.mutateAsync(receivable.id);
                        toast.success(RECEIVABLE_MESSAGES.deleteSuccess);
                        router.visit(RECEIVABLES_LIST_URL);
                    } catch (error) {
                        toast.error(
                            getErrorMessage(
                                error,
                                RECEIVABLE_MESSAGES.deleteError,
                            ),
                        );
                    }
                }}
            />
        </div>
    );
}
