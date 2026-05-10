import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import type { UiPurchase } from '@/types/dashboard-entities';
import type { PurchaseLineItem } from '@/types/dashboard-forms';

function formatPaymentMethod(method: string | undefined): string {
    if (!method) {
return '-';
}

    const methodLower = method.toLowerCase();

    if (methodLower === 'money') {
return 'Dinheiro';
}

    if (methodLower === 'pix') {
return 'PIX';
}

    if (methodLower === 'debit') {
return 'Cartão Débito';
}

    if (methodLower === 'credit') {
return 'Cartão Crédito';
}

    if (methodLower === 'card') {
return 'Cartão';
}

    if (methodLower === 'boleto') {
return 'Boleto';
}

    return method;
}

type PurchaseConfirmationDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    purchaseDraft: UiPurchase | null;
    items: PurchaseLineItem[];
    onConfirm: (purchase: UiPurchase) => void;
};

export function PurchaseConfirmationDialog({
    open,
    onOpenChange,
    purchaseDraft,
    items,
    onConfirm,
}: PurchaseConfirmationDialogProps) {
    const [status, setStatus] = React.useState<'pending' | 'completed'>(
        'pending',
    );

    React.useEffect(() => {
        if (open && purchaseDraft) {
            setStatus(purchaseDraft.status as 'pending' | 'completed');
        }
    }, [open, purchaseDraft]);

    if (!purchaseDraft) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Confirmar compra</DialogTitle>
                    <DialogDescription>
                        Revise os dados antes de finalizar.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-md border p-3 text-sm">
                        <p>
                            <strong>Fornecedor:</strong>{' '}
                            {purchaseDraft.supplierName || '-'}
                        </p>
                        <p>
                            <strong>Pagamento:</strong>{' '}
                            {formatPaymentMethod(purchaseDraft.paymentMethod)}
                            {purchaseDraft.boletoTermDays
                                ? ` (${purchaseDraft.boletoTermDays} dias)`
                                : ''}
                        </p>
                        <p>
                            <strong>Data:</strong>{' '}
                            {purchaseDraft.createdAt
                                ? formatDateBR(purchaseDraft.createdAt)
                                : '-'}
                        </p>
                    </div>

                    <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
                        {items.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Nenhum item na compra.
                            </p>
                        ) : (
                            items.map((item, index) => {
                                const subtotal = item.quantity * item.unitCost;

                                return (
                                    <div
                                        key={`${item.productId}-${index}`}
                                        className="flex items-center justify-between rounded-md border p-2"
                                    >
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium">
                                                {item.productName ||
                                                    `Produto #${item.productId}`}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {item.quantity}x{' '}
                                                {formatCurrencyBR(
                                                    item.unitCost,
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-4 font-medium">
                                            {formatCurrencyBR(subtotal)}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Situação da compra</Label>
                        <ToggleGroup
                            type="single"
                            value={status}
                            onValueChange={(value) => {
                                if (
                                    value === 'pending' ||
                                    value === 'completed'
                                ) {
                                    setStatus(value);
                                }
                            }}
                            className="grid grid-cols-2 gap-2"
                        >
                            <ToggleGroupItem
                                value="pending"
                                variant="outline"
                                className="rounded-md border"
                            >
                                Faturada (A Pagar)
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="completed"
                                variant="outline"
                                className="rounded-md border"
                            >
                                Paga (Finalizada)
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-xl font-black text-primary">
                            {formatCurrencyBR(purchaseDraft.total || 0)}
                        </span>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Voltar
                    </Button>
                    <Button
                        type="button"
                        onClick={() => onConfirm({ ...purchaseDraft, status })}
                    >
                        Confirmar compra
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
