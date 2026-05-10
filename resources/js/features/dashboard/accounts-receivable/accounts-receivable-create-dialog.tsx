import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DatePickerInput } from '@/components/date/date-picker-input';
import { SearchableSelect } from '@/components/searchable-select';
import { Button } from '@/components/ui/button';
import { ClientCreateDialog } from '@/features/dashboard/clients/client-create-dialog';
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
import type { UiCustomer } from '@/types/dashboard-entities';
import { todayString } from '@/utils/sales-dialog';

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

const today = todayString();

export function AccountsReceivableCreateDialog({
    open,
    onOpenChange,
    customers,
    onSubmit,
}: AccountsReceivableCreateDialogProps) {
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [clientCreateOpen, setClientCreateOpen] = useState(false);
    const [item, setItem] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [entryDate, setEntryDate] = useState(today);
    const {
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<Record<string, string>>({ mode: 'onSubmit' });

    const filteredCustomers = useMemo(() => {
        const normalizedQuery = customerSearch.trim().toLowerCase();

        if (!normalizedQuery) {
            return customers;
        }

        return customers.filter((customer) =>
            customer.name.toLowerCase().includes(normalizedQuery),
        );
    }, [customerSearch, customers]);

    const resetForm = () => {
        setCustomerSearch('');
        setCustomerId('');
        setItem('');
        setDescription('');
        setAmount('');
        setEntryDate(today);
    };

    return (
        <>
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                onOpenChange(nextOpen);

                if (!nextOpen) {
                    resetForm();
                }
            }}
        >
            <DialogContent className="!w-[calc(100vw-2rem)] sm:!max-w-[920px]">
                <DialogHeader>
                    <DialogTitle>Nova conta a receber</DialogTitle>
                    <DialogDescription>
                        Preencha os dados principais da conta manual.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();

                        let hasError = false;

                        if (!customerId) {
                            setError('customer_id', {
                                type: 'required',
                                message: 'Cliente e obrigatorio.',
                            });
                            hasError = true;
                        }

                        if (!item.trim()) {
                            setError('item', {
                                type: 'required',
                                message: 'Item e obrigatorio.',
                            });
                            hasError = true;
                        }

                        if (!amount || Number(amount) <= 0) {
                            setError('amount', {
                                type: 'required',
                                message: 'Valor deve ser maior que zero.',
                            });
                            hasError = true;
                        }

                        if (!entryDate) {
                            setError('entry_date', {
                                type: 'required',
                                message: 'Data e obrigatoria.',
                            });
                            hasError = true;
                        }

                        if (hasError) {
                            return;
                        }

                        void onSubmit({
                            customer_id: Number(customerId),
                            item: item.trim(),
                            description: description.trim() || undefined,
                            amount: Number(amount || 0),
                            entry_date: entryDate,
                        }).then(() => {
                            resetForm();
                            onOpenChange(false);
                        });
                    }}
                >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2 sm:col-span-2">
                                <Label>Cliente *</Label>
                                <div className="flex gap-2">
                                    <div className="min-w-0 flex-1">
                                        <SearchableSelect
                                            value={customerId}
                                            searchValue={customerSearch}
                                            onSearchChange={setCustomerSearch}
                                            onChange={(value) => {
                                                setCustomerId(value);
                                                clearErrors('customer_id');
                                                const selectedCustomer =
                                                    customers.find(
                                                        (customer) =>
                                                            customer.id === value,
                                                    );

                                                setCustomerSearch(
                                                    selectedCustomer?.name ?? '',
                                                );
                                            }}
                                            options={filteredCustomers.map(
                                                (customer) => ({
                                                    value: customer.id,
                                                    label: customer.name,
                                                }),
                                            )}
                                            placeholder="Buscar cliente"
                                            emptyMessage="Nenhum cliente encontrado."
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setClientCreateOpen(true)}
                                    >
                                        Novo
                                    </Button>
                                </div>
                            {errors.customer_id?.message ? (
                                <p className="text-xs text-destructive">
                                    {String(errors.customer_id.message)}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="receivable-item">
                                Item <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="receivable-item"
                                value={item}
                                onChange={(event) => {
                                    setItem(event.currentTarget.value);
                                    clearErrors('item');
                                }}
                                placeholder="Ex.: ajuste comercial"
                                required
                            />
                            {errors.item?.message ? (
                                <p className="text-xs text-destructive">
                                    {String(errors.item.message)}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="receivable-amount">
                                Valor <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="receivable-amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(event) => {
                                    setAmount(event.currentTarget.value);
                                    clearErrors('amount');
                                }}
                                placeholder="0,00"
                                required
                            />
                            {errors.amount?.message ? (
                                <p className="text-xs text-destructive">
                                    {String(errors.amount.message)}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="receivable-description">Descricao</Label>
                            <Input
                                id="receivable-description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.currentTarget.value)
                                }
                                placeholder="Detalhes da conta"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Data de lancamento *</Label>
                            <DatePickerInput
                                value={entryDate}
                                onChange={(value) => {
                                    setEntryDate(value);
                                    clearErrors('entry_date');
                                }}
                                placeholder="Selecionar data"
                            />
                            {errors.entry_date?.message ? (
                                <p className="text-xs text-destructive">
                                    {String(errors.entry_date.message)}
                                </p>
                            ) : null}
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
                        <Button
                            type="submit"
                            disabled={!customerId || !item.trim() || !amount}
                        >
                            Salvar conta
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <ClientCreateDialog
            open={clientCreateOpen}
            onOpenChange={setClientCreateOpen}
            onSuccess={({ id, name }) => {
                setCustomerId(String(id));
                setCustomerSearch(name);
                clearErrors('customer_id');
            }}
        />
        </>
    );
}
