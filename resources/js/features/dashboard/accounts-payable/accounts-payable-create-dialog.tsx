import * as React from 'react';
import { DatePickerInput } from '@/components/date/date-picker-input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PAYMENT_METHOD_OPTIONS } from '@/constants/payment-methods';
import type { Purchase } from '@/lib/mocks/mock-data';
import {
    accountsPayableStatusOptions,
    initialAccountsPayableForm,
} from './accounts-payable-create-dialog.constants';
import type {
    AccountsPayableCreateDialogProps,
    AccountsPayableForm,
} from './accounts-payable-create-dialog.types';

export function AccountsPayableCreateDialog({
    open,
    onOpenChange,
    onSubmit,
}: AccountsPayableCreateDialogProps) {
    const [form, setForm] =
        React.useState<AccountsPayableForm>(initialAccountsPayableForm);

    React.useEffect(() => {
        if (open) {
            setForm(initialAccountsPayableForm);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[calc(100vw-2rem)] sm:!max-w-[980px]">
                <DialogHeader>
                    <DialogTitle>Criar Nova Conta a Pagar</DialogTitle>
                    <DialogDescription>
                        Preencha os dados da conta com campos guiados.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-6"
                    onSubmit={(event) => {
                        event.preventDefault();

                        onSubmit({
                            id: '',
                            supplierId: '',
                            supplierName: form.supplierName,
                            total: Number(form.total || 0),
                            status: form.status as Purchase['status'],
                            paymentMethod:
                                form.paymentMethod as Purchase['paymentMethod'],
                            items: Number(form.items || 1),
                            dueDate: form.dueDate,
                            createdAt: form.createdAt,
                        });
                    }}
                >
                    <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <h3 className="text-sm font-semibold">Dados da conta</h3>
                        </div>

                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="ap-supplier">Fornecedor *</Label>
                            <Input
                                id="ap-supplier"
                                value={form.supplierName}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        supplierName: event.target.value,
                                    }))
                                }
                                placeholder="Nome do fornecedor"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ap-items">Itens *</Label>
                            <Input
                                id="ap-items"
                                type="number"
                                min="1"
                                value={form.items}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        items: event.target.value,
                                    }))
                                }
                                placeholder="Quantidade de itens"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ap-total">Total *</Label>
                            <Input
                                id="ap-total"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.total}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        total: event.target.value,
                                    }))
                                }
                                placeholder="Valor total"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <h3 className="text-sm font-semibold">Pagamento e datas</h3>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ap-method">Metodo de pagamento *</Label>
                            <select
                                id="ap-method"
                                value={form.paymentMethod}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        paymentMethod: event.target.value,
                                    }))
                                }
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                {PAYMENT_METHOD_OPTIONS.filter(
                                    (option) =>
                                        option.value === 'money' ||
                                        option.value === 'pix' ||
                                        option.value === 'credit' ||
                                        option.value === 'debit',
                                ).map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ap-status">Status *</Label>
                            <select
                                id="ap-status"
                                value={form.status}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        status: event.target.value,
                                    }))
                                }
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                {accountsPayableStatusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Vencimento *</Label>
                            <DatePickerInput
                                value={form.dueDate}
                                onChange={(value) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        dueDate: value,
                                    }))
                                }
                                placeholder="Selecionar vencimento"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Data *</Label>
                            <DatePickerInput
                                value={form.createdAt}
                                onChange={(value) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        createdAt: value,
                                    }))
                                }
                                placeholder="Selecionar data"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">Criar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
