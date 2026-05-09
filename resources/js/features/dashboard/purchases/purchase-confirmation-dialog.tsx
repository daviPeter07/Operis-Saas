import * as React from 'react';
import { formatCurrencyBR } from '@/lib/format';
import type { UiPurchase } from '@/types/dashboard-entities';
import type { PurchaseLineItem } from '@/types/dashboard-forms';
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
    const [status, setStatus] = React.useState<'pending' | 'completed'>('pending');

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
                            {purchaseDraft.paymentMethod || '-'}
                            {purchaseDraft.boletoTermDays ? ` (${purchaseDraft.boletoTermDays} dias)` : ''}
                        </p>
                        <p>
                            <strong>Data:</strong> {purchaseDraft.createdAt || '-'}
                        </p>
                    </div>

                    <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
                        {items.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Nenhum item na compra.
                            </p>
                        ) : (
                            items.map((item, index) => (
                                <div
                                    key={`${item.productId}-${index}`}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span>
                                        Produto #{item.productId} - {item.quantity}x
                                    </span>
                                    <strong>
                                        {formatCurrencyBR(item.unitCost * item.quantity)}
                                    </strong>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Situação da compra</Label>
                        <ToggleGroup
                            type="single"
                            value={status}
                            onValueChange={(value) => {
                                if (value === 'pending' || value === 'completed') {
                                    setStatus(value);
                                }
                            }}
                            className="grid grid-cols-2 gap-2"
                        >
                            <ToggleGroupItem value="pending" variant="outline" className="rounded-md border">
                                Faturada (A Pagar)
                            </ToggleGroupItem>
                            <ToggleGroupItem value="completed" variant="outline" className="rounded-md border">
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
                    <Button type="button" onClick={() => onConfirm({ ...purchaseDraft, status })}>
                        Confirmar compra
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
