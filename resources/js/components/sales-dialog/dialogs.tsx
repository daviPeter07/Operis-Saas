import { Eye, EyeOff } from 'lucide-react';
import type { Product } from '@/lib/mocks/mock-data';
import type { SaleDiscountType } from '@/types/sales-dialog';
import { formatCurrencyBR } from '@/lib/format';
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { applyFieldMask, onlyDigits } from '@/utils/form-fields';

interface DiscountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    discountType: SaleDiscountType;
    setDiscountType: (value: SaleDiscountType) => void;
    discountValue: string;
    setDiscountValue: (value: string) => void;
    onApply: () => void;
}

export function DiscountDialog({
    open,
    onOpenChange,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    onApply,
}: DiscountDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Aplicar desconto</DialogTitle>
                    <DialogDescription>
                        Defina desconto em valor ou porcentagem.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <ToggleGroup
                        type="single"
                        value={discountType}
                        onValueChange={(value) => {
                            if (value === 'amount' || value === 'percent') {
                                setDiscountType(value);
                                setDiscountValue('');
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
                    <Input
                        type="text"
                        value={discountValue}
                        onKeyDown={(event) => {
                            if (discountType !== 'percent') {
                                return;
                            }

                            const input = event.currentTarget;
                            const currentValue = input.value;
                            const selectionStart =
                                input.selectionStart ?? currentValue.length;
                            const selectionEnd =
                                input.selectionEnd ?? currentValue.length;
                            const hasSelection =
                                selectionStart !== selectionEnd;
                            const endsWithPercent = currentValue.endsWith('%');

                            const shouldHandleBackspace =
                                event.key === 'Backspace' &&
                                !hasSelection &&
                                endsWithPercent &&
                                selectionStart === currentValue.length;

                            const shouldHandleDelete =
                                event.key === 'Delete' &&
                                !hasSelection &&
                                endsWithPercent &&
                                selectionStart === currentValue.length - 1;

                            if (!shouldHandleBackspace && !shouldHandleDelete) {
                                return;
                            }

                            event.preventDefault();

                            const digits = onlyDigits(currentValue);
                            const nextDigits = digits.slice(0, -1);
                            setDiscountValue(
                                applyFieldMask(nextDigits, 'percent'),
                            );
                        }}
                        onChange={(event) =>
                            setDiscountValue(
                                applyFieldMask(
                                    event.currentTarget.value,
                                    discountType === 'amount'
                                        ? 'currency'
                                        : 'percent',
                                ),
                            )
                        }
                        placeholder={
                            discountType === 'amount' ? 'R$ 0,00' : '0,00%'
                        }
                    />
                    <Button type="button" className="w-full" onClick={onApply}>
                        Aplicar desconto
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface AddProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    catalogProduct: Product | null;
    catalogSalePrice: string;
    setCatalogSalePrice: (value: string) => void;
    catalogQuantity: string;
    setCatalogQuantity: (value: string) => void;
    showCostPrice: boolean;
    setShowCostPrice: (
        value: boolean | ((current: boolean) => boolean),
    ) => void;
    onConfirm: () => void;
}

export function AddProductDialog({
    open,
    onOpenChange,
    catalogProduct,
    catalogSalePrice,
    setCatalogSalePrice,
    catalogQuantity,
    setCatalogQuantity,
    showCostPrice,
    setShowCostPrice,
    onConfirm,
}: AddProductDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Adicionar produto</DialogTitle>
                    <DialogDescription>
                        Confirme os dados do item para inserir no carrinho.
                    </DialogDescription>
                </DialogHeader>

                {catalogProduct && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-[56px_1fr] items-center gap-3 rounded-lg border p-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <span className="text-xs font-semibold">
                                    {catalogProduct.name
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {catalogProduct.sku}
                                </p>
                                <p className="font-medium">
                                    {catalogProduct.name}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Preco de venda</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={catalogSalePrice}
                                onChange={(event) =>
                                    setCatalogSalePrice(
                                        event.currentTarget.value,
                                    )
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Quantidade</Label>
                            <div className="flex w-fit items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        setCatalogQuantity(
                                            String(
                                                Math.max(
                                                    1,
                                                    (Number(catalogQuantity) ||
                                                        1) - 1,
                                                ),
                                            ),
                                        )
                                    }
                                >
                                    -
                                </Button>
                                <Input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={catalogQuantity}
                                    onChange={(event) =>
                                        setCatalogQuantity(
                                            event.currentTarget.value,
                                        )
                                    }
                                    className="w-20 text-center"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        setCatalogQuantity(
                                            String(
                                                Math.max(
                                                    1,
                                                    (Number(catalogQuantity) ||
                                                        1) + 1,
                                                ),
                                            ),
                                        )
                                    }
                                >
                                    +
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-md border p-3 text-sm">
                            <div className="mb-1 flex items-center justify-between">
                                <p className="text-muted-foreground">
                                    Preco de compra
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() =>
                                        setShowCostPrice((current) => !current)
                                    }
                                >
                                    {showCostPrice ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="font-semibold">
                                {showCostPrice
                                    ? formatCurrencyBR(catalogProduct.cost)
                                    : '••••••'}
                            </p>
                        </div>

                        <Button
                            type="button"
                            className="w-full"
                            onClick={onConfirm}
                        >
                            Adicionar
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
