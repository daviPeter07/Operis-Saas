import { Minus, Plus } from 'lucide-react';
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
import { applyFieldMask, parseCurrencyInput } from '@/utils/form-fields';
import { toMoneyInput } from '../../utils/functions';
import type { AddProductDialogProps } from '../../utils/types';

export function AddProductDialog({
    open,
    onOpenChange,
    product,
    onConfirm,
}: AddProductDialogProps) {
    const [cost, setCost] = useState(() =>
        product ? toMoneyInput(product.cost) || 'R$ 0,00' : 'R$ 0,00',
    );
    const [quantity, setQuantity] = useState('1');
    const quantityValue = Math.max(1, Math.floor(Number(quantity) || 1));
    const unitCost = parseCurrencyInput(cost);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Adicionar produto</DialogTitle>
                    <DialogDescription>
                        Informe quanto você pagou por unidade e a quantidade
                        comprada.
                    </DialogDescription>
                </DialogHeader>

                {product ? (
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            onConfirm(product, quantityValue, unitCost);
                        }}
                    >
                        <div className="grid grid-cols-[56px_1fr] items-center gap-3 rounded-lg border p-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <span className="text-xs font-semibold">
                                    {product.name.slice(0, 2).toUpperCase()}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    {product.sku}
                                </p>
                                <p className="truncate font-medium">
                                    {product.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Estoque atual: {product.stock} · Venda:{' '}
                                    {formatCurrencyBR(product.price)}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="add-product-cost">
                                Custo unitário
                            </Label>
                            <Input
                                id="add-product-cost"
                                inputMode="numeric"
                                value={cost}
                                onChange={(event) =>
                                    setCost(
                                        applyFieldMask(
                                            event.currentTarget.value,
                                            'currency',
                                        ),
                                    )
                                }
                                placeholder="R$ 0,00"
                            />
                            <p className="text-xs text-muted-foreground">
                                Último custo cadastrado:{' '}
                                {formatCurrencyBR(product.cost)}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="add-product-quantity">
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
                                    id="add-product-quantity"
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

                        <Button type="submit" className="w-full">
                            Adicionar {quantityValue} x{' '}
                            {formatCurrencyBR(unitCost)}
                        </Button>
                    </form>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
