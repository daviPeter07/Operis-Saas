import * as React from 'react';
import { useFormState } from '@/hooks/use-form-state';
import { useQuickCreateSupplier } from '@/hooks/use-quick-create-supplier';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { initialPurchaseForm } from '@/constants/dashboard-form-initials';
import { FinancialEntryDialog } from '../shared/financial-entry-dialog';
import type {
    PurchaseCreateDialogProps,
    PurchaseLineItem,
} from '@/types/dashboard-forms';
import {
    computePurchaseTotals,
    mapFinancialFormToPurchase,
} from '@/utils/dashboard-financial';

export function PurchaseCreateDialog({
    open,
    onOpenChange,
    onSubmit,
    products,
    suppliers,
    onCreateSupplier,
    onApplyStock,
}: PurchaseCreateDialogProps) {
    const { form, setField } = useFormState(initialPurchaseForm, open);
    const handleQuickCreateSupplier = useQuickCreateSupplier({
        onCreateSupplier,
        onSupplierCreated: (supplier) => setField('supplierName', supplier.name),
    });
    const [items, setItems] = React.useState<
        { productId: string; quantity: string }[]
    >([{ productId: '', quantity: '1' }]);

    React.useEffect(() => {
        if (open) {
            setItems([{ productId: '', quantity: '1' }]);
        }
    }, [open]);

    const addLine = () => {
        setItems((prev) => [...prev, { productId: '', quantity: '1' }]);
    };

    const updateLine = (
        index: number,
        key: 'productId' | 'quantity',
        value: string,
    ) => {
        setItems((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [key]: value };
            return next;
        });
    };

    const removeLine = (index: number) => {
        setItems((prev) => {
            const next = [...prev];
            next.splice(index, 1);
            return next.length > 0 ? next : [{ productId: '', quantity: '1' }];
        });
    };

    const parsedItems: PurchaseLineItem[] = items
        .map((item) => ({
            productId: item.productId,
            quantity: Number(item.quantity || 0),
        }))
        .filter((item) => item.productId && item.quantity > 0);

    const computedTotals = computePurchaseTotals(parsedItems, products);

    return (
        <FinancialEntryDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Nova Compra"
            description="Dialogo alinhado ao fluxo de vendas, com dados focados em compras."
            primarySectionTitle="Dados da compra"
            submitLabel="Salvar compra"
            form={form}
            onChange={setField}
            suppliers={suppliers}
            onCreateSupplier={handleQuickCreateSupplier}
            extraSection={
                <div className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Produtos da compra</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addLine}>
                            Adicionar item
                        </Button>
                    </div>

                    {items.map((item, index) => (
                        <div key={`${index}-${item.productId}`} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px_100px]">
                            <div className="grid gap-1">
                                <Label>Produto</Label>
                                <Select
                                    value={item.productId || '__none'}
                                    onValueChange={(value) =>
                                        updateLine(
                                            index,
                                            'productId',
                                            value === '__none' ? '' : value,
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um produto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none">Selecionar</SelectItem>
                                        {products.map((product) => (
                                            <SelectItem key={product.id} value={product.id}>
                                                {product.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-1">
                                <Label>Quantidade</Label>
                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(event) =>
                                        updateLine(index, 'quantity', event.target.value)
                                    }
                                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                />
                            </div>

                            <div className="grid gap-1">
                                <Label>Ação</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => removeLine(index)}
                                >
                                    Remover
                                </Button>
                            </div>
                        </div>
                    ))}

                    <div className="grid gap-2 text-sm text-muted-foreground">
                        <p>Itens calculados: {computedTotals.items}</p>
                        <p>Total calculado: R$ {computedTotals.total.toFixed(2)}</p>
                    </div>
                </div>
            }
            onSubmit={() => {
                onApplyStock(parsedItems);
                onSubmit(mapFinancialFormToPurchase(form, computedTotals));
            }}
        />
    );
}
