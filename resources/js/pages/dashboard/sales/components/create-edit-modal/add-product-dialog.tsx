import { Eye, EyeOff, Minus, Plus } from 'lucide-react';
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
    const [price, setPrice] = useState(() =>
        product ? toMoneyInput(product.price) || 'R$ 0,00' : 'R$ 0,00',
    );
    const [quantity, setQuantity] = useState('1');
    const [showCost, setShowCost] = useState(false);
    const quantityValue = Math.max(1, Math.floor(Number(quantity) || 1));
    const unitPrice = parseCurrencyInput(price);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Adicionar produto</DialogTitle>
                    <DialogDescription>
                        Confirme os dados do item para inserir no carrinho.
                    </DialogDescription>
                </DialogHeader>

                {product ? (
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            onConfirm(product, quantityValue, unitPrice);
                        }}
                    >
                        <div className="grid grid-cols-[56px_1fr] items-center gap-3 rounded-lg border p-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <span className="text-xs font-semibold">
                                    {product.name.slice(0, 2).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {product.sku}
                                </p>
                                <p className="font-medium">{product.name}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="add-product-price">
                                Preço de venda
                            </Label>
                            <Input
                                id="add-product-price"
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

                        <div className="rounded-md border p-3 text-sm">
                            <div className="mb-1 flex items-center justify-between">
                                <p className="text-muted-foreground">
                                    Preço de compra
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    aria-label={
                                        showCost
                                            ? 'Ocultar preço de compra'
                                            : 'Mostrar preço de compra'
                                    }
                                    onClick={() =>
                                        setShowCost((current) => !current)
                                    }
                                >
                                    {showCost ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="font-semibold">
                                {showCost
                                    ? formatCurrencyBR(product.cost)
                                    : '••••••'}
                            </p>
                        </div>

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
