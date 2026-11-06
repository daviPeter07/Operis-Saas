import { CreditCard, Printer } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import { cn } from '@/lib/utils';
import { calculateItemsProfit, toPreviewSale } from '../../utils/functions';
import type { SaleConfirmationDialogProps } from '../../utils/types';
import { PrintPreviewDialog } from '../print-preview-dialog';

export function SaleConfirmationDialog({
    open,
    onOpenChange,
    draft,
    isSubmitting,
    onConfirm,
}: SaleConfirmationDialogProps) {
    const isCrediario = draft.paymentMethod === 'crediario';
    const [status, setStatus] = useState(
        isCrediario ? 'pending' : draft.status,
    );
    const [paidInstallments, setPaidInstallments] = useState(
        draft.paidInstallments,
    );
    const [showProfit, setShowProfit] = useState(false);
    const [delivered, setDelivered] = useState(draft.delivered);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const installmentAmount = (number: number) =>
        draft.installmentAmounts[number - 1] ?? 0;
    const paidAmount = paidInstallments.reduce(
        (sum, number) => sum + installmentAmount(number),
        0,
    );
    const profit = calculateItemsProfit(draft.lineItems) - draft.discount;
    const installmentNumbers = Array.from(
        { length: draft.installments },
        (_, index) => index + 1,
    );
    const confirmed = { ...draft, status, paidInstallments, delivered };

    const toggleInstallment = (number: number) =>
        setPaidInstallments((current) =>
            current.includes(number)
                ? current.filter((item) => item !== number)
                : [...current, number],
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
                                    {draft.clientName || 'Sem cliente'}
                                </div>
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                                <Label>Data:</Label>
                                <div className="font-semibold">
                                    {formatDateBR(draft.date)}
                                </div>
                            </div>

                            <div className="mt-4">
                                <Label>Itens</Label>
                                <div className="mt-2 space-y-2">
                                    {draft.lineItems.map((item) => (
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
                                        {formatCurrencyBR(draft.subtotal)}
                                    </div>
                                </div>

                                <div>
                                    <Label>Desconto</Label>
                                    <div className="mt-1 font-semibold">
                                        {draft.discount > 0
                                            ? `- ${formatCurrencyBR(draft.discount)}`
                                            : formatCurrencyBR(0)}
                                    </div>
                                </div>

                                <div>
                                    <Label>Total</Label>
                                    <div className="mt-1 text-lg font-bold text-primary">
                                        {formatCurrencyBR(draft.total)}
                                    </div>
                                </div>

                                {isCrediario ? (
                                    <div>
                                        <Label>Entrada</Label>
                                        <div className="mt-1 font-semibold">
                                            {formatCurrencyBR(
                                                draft.crediarioEntry ?? 0,
                                            )}
                                        </div>
                                    </div>
                                ) : null}

                                <div>
                                    <Label>Lucro</Label>
                                    <div className="mt-1 font-semibold">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowProfit(
                                                    (current) => !current,
                                                )
                                            }
                                            className={cn(
                                                'text-sm underline',
                                                !showProfit &&
                                                    'text-muted-foreground',
                                            )}
                                        >
                                            {showProfit
                                                ? formatCurrencyBR(profit)
                                                : 'Mostrar lucro'}
                                        </button>
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
                                aria-label="Imprimir comprovante"
                                onClick={() => setIsPreviewOpen(true)}
                            >
                                <Printer className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Label>Status da venda</Label>
                        {isCrediario ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                                No crediário, a venda fica pendente até a
                                quitação das parcelas.
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
                                disabled={isCrediario}
                                onClick={() => setStatus('completed')}
                            >
                                Pago
                            </Button>
                        </div>
                    </div>

                    {isCrediario ? (
                        <div className="rounded-md border p-3">
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <CreditCard className="h-4 w-4" />
                                <Label>Confirmar parcelas pagas</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setPaidInstallments(installmentNumbers)
                                    }
                                >
                                    Marcar todas
                                </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {installmentNumbers.map((number) => {
                                    const isPaid =
                                        paidInstallments.includes(number);

                                    return (
                                        <button
                                            key={number}
                                            type="button"
                                            onClick={() =>
                                                toggleInstallment(number)
                                            }
                                            className={cn(
                                                'flex items-center gap-2 rounded-md border p-2 text-left transition-colors',
                                                isPaid
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-500/10'
                                                    : 'hover:bg-muted',
                                            )}
                                        >
                                            <Checkbox checked={isPaid} />
                                            <div>
                                                <div className="text-sm font-medium">
                                                    {number}/
                                                    {draft.installments}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatCurrencyBR(
                                                        installmentAmount(
                                                            number,
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            {paidInstallments.length > 0 ? (
                                <div className="mt-3 text-sm font-medium text-green-600">
                                    {paidInstallments.length} parcela(s)
                                    confirmada(s):{' '}
                                    {formatCurrencyBR(paidAmount)}
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="flex items-center gap-2">
                        <input
                            id="delivered"
                            type="checkbox"
                            checked={delivered}
                            onChange={(event) =>
                                setDelivered(event.target.checked)
                            }
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
                        disabled={isSubmitting}
                        onClick={() => onConfirm(confirmed)}
                    >
                        {isSubmitting
                            ? 'Registrando...'
                            : 'Confirmar e registrar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
            <PrintPreviewDialog
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                sale={toPreviewSale(confirmed)}
                initialMode="thermal"
            />
        </Dialog>
    );
}
