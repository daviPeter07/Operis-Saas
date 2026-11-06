import { Minus, Plus, Wrench } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { formatCurrencyBR } from '@/lib/format';
import {
    applyFieldMask,
    parseCurrencyInput,
    toMoneyInput,
} from '@/utils/form-fields';
import type { AddServiceDialogProps } from '../../utils/types';

export function AddServiceDialog({
    open,
    onOpenChange,
    service,
    onConfirm,
}: AddServiceDialogProps) {
    const [price, setPrice] = useState(() =>
        service ? toMoneyInput(service.price) || 'R$ 0,00' : 'R$ 0,00',
    );
    const [quantity, setQuantity] = useState('1');
    const quantityValue = Math.max(1, Math.floor(Number(quantity) || 1));
    const unitPrice = parseCurrencyInput(price);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Adicionar serviço</DialogTitle>
                    <DialogDescription>
                        Confirme o valor e quantas vezes o serviço foi feito
                        nesta venda.
                    </DialogDescription>
                </DialogHeader>

                {service ? (
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            onConfirm(service, quantityValue, unitPrice);
                        }}
                    >
                        <div className="grid grid-cols-[56px_1fr] items-center gap-3 rounded-lg border p-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <Wrench aria-hidden className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium">{service.name}</p>
                                {service.description ? (
                                    <p className="line-clamp-2 text-xs text-muted-foreground">
                                        {service.description}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="add-service-price">Valor</Label>
                            <Input
                                id="add-service-price"
                                inputMode="numeric"
                                value={price}
                                onChange={(event) =>
                                    setPrice(
                                        applyFieldMask(
                                            event.currentTarget.value,
                                            'currency',
                                        ),
                                    )
                                }
                                placeholder="R$ 0,00"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="add-service-quantity">
                                Quantidade
                            </Label>
                            <div className="flex w-fit items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    aria-label="Diminuir quantidade"
                                    onClick={() =>
                                        setQuantity(
                                            String(
                                                Math.max(1, quantityValue - 1),
                                            ),
                                        )
                                    }
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                    id="add-service-quantity"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={quantity}
                                    onChange={(event) =>
                                        setQuantity(event.currentTarget.value)
                                    }
                                    className="w-20 text-center"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    aria-label="Aumentar quantidade"
                                    onClick={() =>
                                        setQuantity(String(quantityValue + 1))
                                    }
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {service.cost !== null ? (
                            <p className="rounded-md border p-3 text-sm text-muted-foreground">
                                Custo do serviço:{' '}
                                <span className="font-semibold text-foreground">
                                    {formatCurrencyBR(service.cost)}
                                </span>
                            </p>
                        ) : null}

                        <Button type="submit" className="w-full">
                            Adicionar {quantityValue} x{' '}
                            {formatCurrencyBR(unitPrice)}
                        </Button>
                    </form>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
