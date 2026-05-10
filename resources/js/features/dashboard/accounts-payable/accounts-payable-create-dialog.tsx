import { useEffect, useState } from 'react';
import { initialAccountsPayableForm } from '@/constants/dashboard-form-initials';
import { useFormState } from '@/hooks/use-form-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { AccountsPayableCreateDialogProps } from '@/types/dashboard-forms';
import { FinancialEntryDialog } from '../shared/financial-entry-dialog';
import { SupplierCreateDialog } from '../suppliers/supplier-create-dialog';

export function AccountsPayableCreateDialog({
    open,
    onOpenChange,
    onSubmit,
    suppliers,
    onCreateSupplier,
}: AccountsPayableCreateDialogProps) {
    const { form, setField } = useFormState(initialAccountsPayableForm, open);
    const [supplierCreateOpen, setSupplierCreateOpen] = useState(false);
    const [item, setItem] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(form.createdAt);
    const [status, setStatus] = useState<'pending' | 'paid'>('pending');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!open) {
            return;
        }

        setItem('');
        setDescription('');
        setDueDate(form.createdAt);
        setStatus('pending');
        setErrors({});
    }, [form.createdAt, open]);

    return (
        <>
            <FinancialEntryDialog
                open={open}
                onOpenChange={onOpenChange}
                title="Nova conta a pagar"
                description="Use o mesmo fechamento operacional das compras para revisar fornecedor, valores e pagamento."
                primarySectionTitle="Fechamento da conta"
                submitLabel="Continuar"
                form={form}
                onChange={setField}
                suppliers={suppliers}
                onOpenCreateSupplier={() => setSupplierCreateOpen(true)}
                showOperationSummary={false}
                showStatusField={false}
                catalogSection={
                    <div className="space-y-3 rounded-xl border bg-muted/20 p-5">
                        {errors.supplier ? (
                            <p className="text-xs text-destructive">
                                {errors.supplier}
                            </p>
                        ) : null}
                        {errors.total ? (
                            <p className="text-xs text-destructive">
                                {errors.total}
                            </p>
                        ) : null}

                        <div className="grid gap-2">
                            <Label htmlFor="payable-item">
                                Item <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="payable-item"
                                value={item}
                                onChange={(event) => setItem(event.currentTarget.value)}
                                placeholder="Ex.: pagamento de frete"
                            />
                            {errors.item ? (
                                <p className="text-xs text-destructive">
                                    {errors.item}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="payable-description">Descrição</Label>
                            <Input
                                id="payable-description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.currentTarget.value)
                                }
                                placeholder="Detalhes da conta"
                            />
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="payable-due-date">
                                    Vencimento{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="payable-due-date"
                                    type="date"
                                    value={dueDate}
                                    onChange={(event) =>
                                        setDueDate(event.currentTarget.value)
                                    }
                                />
                                {errors.due_date ? (
                                    <p className="text-xs text-destructive">
                                        {errors.due_date}
                                    </p>
                                ) : null}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="payable-status">
                                    Status{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={status}
                                    onValueChange={(value) => {
                                        if (value === 'pending' || value === 'paid') {
                                            setStatus(value);
                                        }
                                    }}
                                >
                                    <SelectTrigger id="payable-status">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">
                                            Pendente
                                        </SelectItem>
                                        <SelectItem value="paid">Pago</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                }
                onSubmit={() => {
                    const supplier = suppliers.find(
                        (entry) => entry.name === form.supplierName,
                    );

                    const nextErrors: Record<string, string> = {};

                    if (!supplier) {
                        nextErrors.supplier = 'Fornecedor é obrigatório.';
                    }

                    if (!item.trim()) {
                        nextErrors.item = 'Item é obrigatório.';
                    }

                    if (!(Number(form.total || 0) > 0)) {
                        nextErrors.total = 'Valor deve ser maior que zero.';
                    }

                    if (!dueDate) {
                        nextErrors.due_date = 'Vencimento é obrigatório.';
                    }

                    setErrors(nextErrors);

                    if (Object.keys(nextErrors).length > 0 || !supplier) {
                        return;
                    }

                    const paymentMethod: 'cash' | 'pix' | 'card' | 'installment' | 'boleto' =
                        form.paymentMethod === 'money'
                            ? 'cash'
                            : form.paymentMethod === 'card'
                              ? 'card'
                              : form.paymentMethod === 'boleto'
                                ? 'boleto'
                                : 'pix';

                    onSubmit({
                        supplier_id: Number(supplier.id),
                        item: item.trim(),
                        description: description.trim() || undefined,
                        amount: Number(form.total || 0),
                        entry_date: form.createdAt,
                        due_date: dueDate,
                        payment_method: paymentMethod,
                        status,
                    });
                }}
            />

            <SupplierCreateDialog
                open={supplierCreateOpen}
                onOpenChange={setSupplierCreateOpen}
                onSuccess={({ id, name }) => {
                    void onCreateSupplier({
                        id: String(id),
                        name,
                        email: '',
                        phone: '',
                        document: '',
                        city: '',
                        state: '',
                        address: '',
                        createdAt: new Date().toISOString().slice(0, 10),
                    }).then((supplier) => {
                        setField('supplierName', supplier.name);
                    });
                }}
            />
        </>
    );
}
