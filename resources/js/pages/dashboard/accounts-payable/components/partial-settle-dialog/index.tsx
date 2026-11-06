import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrencyBR } from '@/lib/format';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/form-fields';
import { PAYABLE_MESSAGES, SETTLE_LABELS } from '../../utils/constants';
import type { PartialSettleDialogProps } from '../../utils/types';

export function PartialSettleDialog({
    open,
    onOpenChange,
    row,
    isSubmitting,
    onConfirm,
}: PartialSettleDialogProps) {
    const [value, setValue] = useState('');
    const amount = parseCurrencyInput(value);
    const remaining = row?.remaining ?? 0;
    const error =
        value === ''
            ? null
            : amount <= 0
              ? PAYABLE_MESSAGES.partialRequired
              : amount > remaining + 0.001
                ? PAYABLE_MESSAGES.partialTooHigh
                : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{SETTLE_LABELS.partialTitle}</DialogTitle>
                    <DialogDescription>
                        Registre uma parte do valor. O resto continua em aberto.
                    </DialogDescription>
                </DialogHeader>

                {row ? (
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();

                            if (amount > 0 && !error) {
                                onConfirm(amount);
                            }
                        }}
                    >
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border p-3 text-sm">
                            <dt className="text-muted-foreground">Conta</dt>
                            <dd className="truncate font-medium">
                                {row.description}
                            </dd>
                            <dt className="text-muted-foreground">Valor</dt>
                            <dd className="font-medium tabular-nums">
                                {formatCurrencyBR(row.amount)}
                            </dd>
                            <dt className="text-muted-foreground">Em aberto</dt>
                            <dd className="font-medium tabular-nums">
                                {formatCurrencyBR(remaining)}
                            </dd>
                        </dl>

                        <div className="space-y-2">
                            <Label htmlFor="partial-settle-amount">
                                {SETTLE_LABELS.partialAmount}
                            </Label>
                            <Input
                                id="partial-settle-amount"
                                inputMode="numeric"
                                value={value}
                                autoFocus
                                aria-invalid={error !== null}
                                onChange={(event) =>
                                    setValue(
                                        formatCurrencyInput(
                                            event.currentTarget.value,
                                        ),
                                    )
                                }
                                placeholder="R$ 0,00"
                            />
                            <p
                                className={
                                    error
                                        ? 'text-xs text-destructive'
                                        : 'text-xs text-muted-foreground'
                                }
                            >
                                {error ??
                                    `Fica em aberto: ${formatCurrencyBR(Math.max(0, remaining - amount))}`}
                            </p>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    isSubmitting ||
                                    amount <= 0 ||
                                    error !== null
                                }
                            >
                                {isSubmitting ? 'Salvando...' : 'Confirmar'}
                            </Button>
                        </DialogFooter>
                    </form>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
