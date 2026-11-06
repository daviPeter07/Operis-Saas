import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatCurrencyBR } from '@/lib/format';
import { applyFieldMask, onlyDigits } from '@/utils/form-fields';
import { NO_DISCOUNT } from '../../utils/constants';
import {
    calculateDiscountAmount,
    parseDiscountInput,
    toDiscountInput,
} from '../../utils/functions';
import { makeDiscountSchema } from '../../utils/schemas';
import type { DiscountDialogProps, SaleDiscountType } from '../../utils/types';

export function DiscountDialog({
    open,
    onOpenChange,
    subtotal,
    applied,
    onApply,
}: DiscountDialogProps) {
    const [type, setType] = useState<SaleDiscountType>(applied.type);
    const [input, setInput] = useState(() => toDiscountInput(applied));
    const [error, setError] = useState<string | null>(null);

    const value = parseDiscountInput(type, input);
    const amount = calculateDiscountAmount(subtotal, { type, value });
    const mask = type === 'amount' ? 'currency' : 'percent';

    const apply = () => {
        const result = makeDiscountSchema(subtotal).safeParse({ type, value });

        if (!result.success) {
            setError(result.error.issues[0]?.message ?? null);

            return;
        }

        onApply(result.data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Aplicar desconto</DialogTitle>
                    <DialogDescription>
                        Defina o desconto em valor ou porcentagem sobre o
                        subtotal de {formatCurrencyBR(subtotal)}.
                    </DialogDescription>
                </DialogHeader>
                <form
                    className="space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        apply();
                    }}
                >
                    <ToggleGroup
                        type="single"
                        value={type}
                        onValueChange={(next) => {
                            if (next === 'amount' || next === 'percent') {
                                setType(next);
                                setInput('');
                                setError(null);
                            }
                        }}
                        variant="outline"
                        className="w-full"
                    >
                        <ToggleGroupItem value="amount" className="flex-1">
                            Valor (R$)
                        </ToggleGroupItem>
                        <ToggleGroupItem value="percent" className="flex-1">
                            %
                        </ToggleGroupItem>
                    </ToggleGroup>
                    <div className="space-y-1.5">
                        <Input
                            type="text"
                            inputMode="numeric"
                            aria-label="Valor do desconto"
                            aria-invalid={error !== null}
                            value={input}
                            onKeyDown={(event) => {
                                const current = event.currentTarget.value;
                                const removesPercentSign =
                                    type === 'percent' &&
                                    event.key === 'Backspace' &&
                                    current.endsWith('%') &&
                                    event.currentTarget.selectionStart ===
                                        current.length &&
                                    event.currentTarget.selectionEnd ===
                                        current.length;

                                if (removesPercentSign) {
                                    event.preventDefault();
                                    setInput(
                                        applyFieldMask(
                                            onlyDigits(current).slice(0, -1),
                                            'percent',
                                        ),
                                    );
                                    setError(null);
                                }
                            }}
                            onChange={(event) => {
                                setInput(
                                    applyFieldMask(
                                        event.currentTarget.value,
                                        mask,
                                    ),
                                );
                                setError(null);
                            }}
                            placeholder={
                                type === 'amount' ? 'R$ 0,00' : '0,00%'
                            }
                        />
                        {error ? (
                            <p className="text-sm text-destructive">{error}</p>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Desconto de {formatCurrencyBR(amount)}. Total
                                com desconto:{' '}
                                {formatCurrencyBR(subtotal - amount)}.
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        {applied.value > 0 ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="sm:flex-1"
                                onClick={() => onApply(NO_DISCOUNT)}
                            >
                                Remover desconto
                            </Button>
                        ) : null}
                        <Button type="submit" className="sm:flex-1">
                            Aplicar desconto
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
