import { useEffect, useState } from 'react';
import { useFormState } from '@/hooks/use-form-state';
import { initialAccountsPayableForm } from '@/constants/dashboard-form-initials';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UiCustomer, UiSupplier } from '@/types/dashboard-entities';
import { FinancialEntryDialog } from '../shared/financial-entry-dialog';

type AccountsReceivableCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customers: UiCustomer[];
    onSubmit: (payload: {
        customer_id: number;
        item: string;
        description?: string;
        amount: number;
        entry_date: string;
    }) => Promise<void>;
};

export function AccountsReceivableCreateDialog({
    open,
    onOpenChange,
    customers,
    onSubmit,
}: AccountsReceivableCreateDialogProps) {
    const { form, setField } = useFormState(initialAccountsPayableForm, open);
    const [item, setItem] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const clearError = (key: string) => {
        setErrors((current) => {
            if (!current[key]) {
                return current;
            }

            const next = { ...current };
            delete next[key];

            return next;
        });
    };

    useEffect(() => {
        if (form.supplierName && errors.customer) {
            clearError('customer');
        }
        if (Number(form.total || 0) > 0 && errors.total) {
            clearError('total');
        }
    }, [form.supplierName, form.total, errors.customer, errors.total]);

    const customerOptions: UiSupplier[] = customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        document: customer.document,
        city: customer.city,
        state: customer.state,
        address: customer.address,
        createdAt: customer.createdAt,
    }));

    return (
        <FinancialEntryDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Nova conta a receber"
            description="Use o mesmo layout operacional para registrar um recebimento manual."
            primarySectionTitle="Fechamento da conta"
            primarySectionDescription="Cliente, pagamento e fechamento operacional."
            submitLabel="Salvar conta"
            showOperationSummary={false}
            showStatusField={false}
            form={form}
            onChange={setField}
            suppliers={customerOptions}
            partyLabel="Cliente"
            partySearchPlaceholder="Buscar cliente"
            partyEmptyMessage="Nenhum cliente encontrado."
            partyCreateTooltip="Criar cliente"
            catalogSection={
                <div className="space-y-4 rounded-xl border bg-muted/20 p-5">
                    {errors.customer ? (
                        <p className="text-xs text-destructive">{errors.customer}</p>
                    ) : null}
                    {errors.total ? (
                        <p className="text-xs text-destructive">{errors.total}</p>
                    ) : null}
                    <div className="grid gap-2">
                        <Label htmlFor="receivable-item">
                            Item <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="receivable-item"
                            value={item}
                            onChange={(event) => {
                                setItem(event.currentTarget.value);
                                clearError('item');
                            }}
                            placeholder="Ex.: ajuste comercial"
                        />
                        {errors.item ? (
                            <p className="text-xs text-destructive">{errors.item}</p>
                        ) : null}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="receivable-description">Descrição</Label>
                        <Input
                            id="receivable-description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.currentTarget.value)
                            }
                            placeholder="Detalhes do lançamento"
                        />
                    </div>
                </div>
            }
            onSubmit={() => {
                const customer = customerOptions.find(
                    (entry) => entry.name === form.supplierName,
                );

                const nextErrors: Record<string, string> = {};

                if (!customer) {
                    nextErrors.customer = 'Cliente é obrigatório.';
                }

                if (!item.trim()) {
                    nextErrors.item = 'Item é obrigatório.';
                }

                if (!(Number(form.total || 0) > 0)) {
                    nextErrors.total = 'Valor deve ser maior que zero.';
                }

                setErrors(nextErrors);

                if (Object.keys(nextErrors).length > 0) {
                    return;
                }

                const selectedCustomer = customer;

                if (!selectedCustomer) {
                    return;
                }

                void onSubmit({
                    customer_id: Number(selectedCustomer.id),
                    item: item.trim(),
                    description: description.trim() || undefined,
                    amount: Number(form.total || 0),
                    entry_date: form.createdAt,
                }).then(() => {
                    onOpenChange(false);
                    setItem('');
                    setDescription('');
                    setErrors({});
                });
            }}
        />
    );
}
