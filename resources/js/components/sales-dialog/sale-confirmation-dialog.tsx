import { Printer } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { SaleDocumentPreviewDialog } from '@/features/dashboard/sales/sale-document-preview-dialog';
import { formatCurrencyBR } from '@/lib/format';
import type { Sale } from '@/schemas/sale';
import type { SalesRecord } from '@/types/sales-dialog';
import { todayString } from '@/utils/sales-dialog';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    saleDraft: SalesRecord | null;
    onConfirm: (sale: SalesRecord & { delivered?: boolean }) => void;
};

export function SaleConfirmationDialog({
    open,
    onOpenChange,
    saleDraft,
    onConfirm,
}: Props) {
    if (!saleDraft) {
        return null;
    }

    return (
        <SaleConfirmationDialogContent
            key={`${saleDraft.id}-${open ? 'open' : 'closed'}`}
            open={open}
            onOpenChange={onOpenChange}
            saleDraft={saleDraft}
            onConfirm={onConfirm}
        />
    );
}

type SaleConfirmationDialogContentProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    saleDraft: SalesRecord;
    onConfirm: (sale: SalesRecord & { delivered?: boolean }) => void;
};

function SaleConfirmationDialogContent({
    open,
    onOpenChange,
    saleDraft,
    onConfirm,
}: SaleConfirmationDialogContentProps) {
    const [showProfit, setShowProfit] = React.useState(false);
    const [status, setStatus] = React.useState<'pending' | 'completed'>(
        saleDraft.paymentMethod === 'crediario'
            ? 'pending'
            : saleDraft.status === 'completed'
              ? 'completed'
              : 'pending',
    );
    const [delivered, setDelivered] = React.useState(false);
    const [previewOpen, setPreviewOpen] = React.useState(false);
    const [previewMode, setPreviewMode] = React.useState<'digital' | 'thermal'>(
        'thermal',
    );

    const subtotal = saleDraft.lineItems.reduce(
        (sum, item) => sum + (item.subtotal ?? item.unitPrice * item.quantity),
        0,
    );

    const mappedPreviewSale: Sale = React.useMemo(() => {
        const items = (saleDraft.lineItems || []).map((li) => ({
            id: Number(li.id) || 0,
            product_id: Number(li.productId) || 0,
            product_name: li.productName,
            category_name: undefined,
            quantity: li.quantity,
            unit_price: li.unitPrice,
            unit_cost: li.unitCost,
            subtotal: li.subtotal,
        }));

        const paymentMethod =
            saleDraft.paymentMethod === 'money'
                ? 'cash'
                : saleDraft.paymentMethod === 'crediario'
                  ? 'crediario'
                  : saleDraft.paymentMethod === 'card'
                    ? saleDraft.cardType === 'credit'
                        ? 'card_credit'
                        : 'card_debit'
                    : 'pix';

        const total =
            typeof saleDraft.finalTotal === 'number'
                ? saleDraft.finalTotal
                : typeof saleDraft.total === 'number'
                  ? saleDraft.total
                  : items.reduce(
                        (s, it) =>
                            s + (it.subtotal ?? it.unit_price * it.quantity),
                        0,
                    );

        const subtotalCalc = items.reduce(
            (s, it) => s + (it.subtotal ?? it.unit_price * it.quantity),
            0,
        );

        return {
            id: Number(saleDraft.id) || 0,
            customer_id: saleDraft.clientId ? Number(saleDraft.clientId) : null,
            customer_name: saleDraft.clientName,
            date: saleDraft.createdAt || todayString(),
            subtotal: subtotalCalc,
            total,
            status: saleDraft.status,
            payment_method: paymentMethod,
            items,
        };
    }, [saleDraft]);

    const profit = saleDraft.lineItems.reduce(
        (sum, item) =>
            sum +
            ((item.unitPrice ?? 0) - (item.unitCost ?? 0)) *
                (item.quantity ?? 0),
        0,
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[calc(100vw-2rem)] sm:!max-w-[720px]">
                <DialogHeader>
                    <DialogTitle>Resumo da venda</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                        <div>
                            <div className="flex items-center gap-2">
                                <Label>Cliente:</Label>
                                <div className="font-semibold">
                                    {saleDraft.clientName || 'Sem cliente'}
                                </div>
                            </div>

                            <div className="mt-4">
                                <Label>Itens</Label>
                                <div className="mt-2 space-y-2">
                                    {saleDraft.lineItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start justify-between rounded-md border p-2"
                                        >
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-medium">
                                                    {item.productName}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.quantity} x{' '}
                                                    {formatCurrencyBR(
                                                        item.unitPrice,
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-4 font-medium">
                                                {formatCurrencyBR(
                                                    item.subtotal,
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <aside className="rounded-md border p-3">
                            <div className="space-y-3">
                                <div>
                                    <Label>Subtotal</Label>
                                    <div className="mt-1 font-semibold">
                                        {formatCurrencyBR(subtotal ?? 0)}
                                    </div>
                                </div>

                                <div>
                                    <Label>Desconto</Label>
                                    <div className="mt-1 font-semibold">
                                        {formatCurrencyBR(
                                            saleDraft.discountAmountApplied ??
                                                0,
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label>Total</Label>
                                    <div className="mt-1 text-lg font-bold text-primary">
                                        {formatCurrencyBR(
                                            saleDraft.finalTotal ??
                                                saleDraft.total ??
                                                0,
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label>Lucro</Label>
                                    <div className="mt-1 font-semibold">
                                        {showProfit ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowProfit(false)
                                                }
                                                className="text-sm underline"
                                            >
                                                {formatCurrencyBR(profit)}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="text-sm text-muted-foreground underline"
                                                onClick={() =>
                                                    setShowProfit(true)
                                                }
                                            >
                                                Mostrar lucro
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>

                    <div className="flex justify-end">
                        <div className="flex items-center gap-3">
                            <div className="text-sm font-medium">
                                Imprimir comprovante
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setPreviewMode('thermal');
                                    setPreviewOpen(true);
                                }}
                            >
                                <Printer className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Label>Status da venda</Label>
                        {saleDraft.paymentMethod === 'crediario' ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                                No crediario, a venda permanece pendente ate a quitacao.
                            </p>
                        ) : null}
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant={
                                    status === 'pending' ? 'default' : 'outline'
                                }
                                onClick={() => setStatus('pending')}
                            >
                                Pendente
                            </Button>
                            <Button
                                type="button"
                                variant={
                                    status === 'completed'
                                        ? 'default'
                                        : 'outline'
                                }
                                disabled={saleDraft.paymentMethod === 'crediario'}
                                onClick={() => setStatus('completed')}
                            >
                                Pago
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="delivered"
                            type="checkbox"
                            checked={delivered}
                            onChange={(e) => setDelivered(e.target.checked)}
                        />
                        <label htmlFor="delivered" className="text-sm">
                            Marcar como entregue
                        </label>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Fechar
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            const confirmed = {
                                ...saleDraft,
                                status,
                                delivered,
                            };

                            onConfirm(confirmed);
                        }}
                    >
                        Confirmar e registrar
                    </Button>
                </DialogFooter>
            </DialogContent>
            <SaleDocumentPreviewDialog
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                sale={mappedPreviewSale}
                initialMode={previewMode}
            />
        </Dialog>
    );
}

export default SaleConfirmationDialog;
