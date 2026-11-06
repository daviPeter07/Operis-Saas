import { router } from '@inertiajs/react';
import { Ban, Pencil, Printer, ReceiptText, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DetailsBackButton, DetailsHeader } from '@/components/details-page';
import { HistoryTimeline } from '@/components/history-timeline';
import { PageContent } from '@/components/page-content';
import { DeleteConfirmDialog } from '@/components/table/delete-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccountReceivables } from '@/hooks/use-account-receivables';
import { useDeleteSale } from '@/hooks/use-sales';
import AppLayout from '@/layouts/app-layout';
import { CreateEditModal } from './components/create-edit-modal';
import { PrintPreviewDialog } from './components/print-preview-dialog';
import { SaleDetails } from './components/sale-details';
import { SaleInstallments } from './components/sale-installments';
import { SaleItems } from './components/sale-items';
import { SaleStatusChip } from './components/sale-status-chip';
import {
    CANCEL_SALE_DIALOG,
    DELETE_SALE_DIALOG,
    SALE_MESSAGES,
    SALES_LIST_URL,
} from './utils/constants';
import {
    getErrorMessage,
    getSaleReceivables,
    getShowBreadcrumbs,
    goBackToSales,
    toHistoryItems,
    useCancelSale,
    useSale,
} from './utils/functions';
import type { SalesShowPageProps } from './utils/types';

export default function SalesShowPage({ saleId }: SalesShowPageProps) {
    return (
        <AppLayout breadcrumbs={getShowBreadcrumbs(saleId)}>
            <PageContent>
                <ShowContent key={saleId} saleId={saleId} />
            </PageContent>
        </AppLayout>
    );
}

function ShowContent({ saleId }: SalesShowPageProps) {
    const { data: sale, isPending, isError } = useSale(saleId);
    const { data: receivables = [] } = useAccountReceivables();
    const deleteSale = useDeleteSale();
    const cancelSale = useCancelSale();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPrintOpen, setIsPrintOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const backButton = (
        <DetailsBackButton
            label="Voltar para as vendas"
            onClick={goBackToSales}
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

    if (isError || !sale) {
        return (
            <div className="space-y-6">
                {backButton}
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
                    <ReceiptText className="size-10 text-muted-foreground" />
                    <p className="text-lg font-semibold">
                        Venda não encontrada
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Ela pode ter sido excluída ou pertencer a outra empresa.
                        Volte para as vendas e escolha outra.
                    </p>
                </div>
            </div>
        );
    }

    const saleReceivables = getSaleReceivables(receivables, sale.id);
    const isCancelled = sale.status === 'cancelled';

    return (
        <div className="space-y-6">
            {backButton}

            <DetailsHeader
                title={`Detalhes da venda #${sale.id}`}
                status={<SaleStatusChip status={sale.status} />}
                actions={
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => setIsPrintOpen(true)}
                        >
                            <Printer className="size-4" />
                            Imprimir
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2"
                            disabled={isCancelled}
                            title={
                                isCancelled
                                    ? 'Venda cancelada não pode ser editada'
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
                                Cancelar venda
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

            <SaleDetails sale={sale} />

            <SaleItems sale={sale} />

            {saleReceivables.length > 0 ? (
                <SaleInstallments receivables={saleReceivables} />
            ) : null}

            <HistoryTimeline items={toHistoryItems(sale)} />

            {isCancelled ? null : (
                <CreateEditModal
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    sale={sale}
                />
            )}

            <PrintPreviewDialog
                open={isPrintOpen}
                onOpenChange={setIsPrintOpen}
                sale={sale}
                initialMode="thermal"
            />

            <DeleteConfirmDialog
                open={isCancelOpen}
                onOpenChange={setIsCancelOpen}
                {...CANCEL_SALE_DIALOG}
                itemName={`Venda #${sale.id}`}
                onConfirm={async () => {
                    try {
                        await cancelSale.mutateAsync(sale.id);
                        toast.success(SALE_MESSAGES.cancelSuccess);
                    } catch (error) {
                        toast.error(
                            getErrorMessage(error, SALE_MESSAGES.cancelError),
                        );
                    }
                }}
            />

            <DeleteConfirmDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                {...DELETE_SALE_DIALOG}
                itemName={`Venda #${sale.id}`}
                onConfirm={async () => {
                    try {
                        await deleteSale.mutateAsync(sale.id);
                        toast.success(SALE_MESSAGES.deleteSuccess);
                        router.visit(SALES_LIST_URL);
                    } catch (error) {
                        toast.error(
                            getErrorMessage(error, SALE_MESSAGES.deleteError),
                        );
                    }
                }}
            />
        </div>
    );
}
