import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DatePickerInput } from '@/components/date/date-picker-input';
import { SearchableSelect } from '@/components/searchable-select';
import { Button } from '@/components/ui/button';
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

type ManualAccountReceivableDialogProps = {
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

const today = new Date().toISOString().slice(0, 10);

export function ManualAccountReceivableDialog({
    open,
    onOpenChange,
    customers,
    onSubmit,
}: ManualAccountReceivableDialogProps) {
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerId, setCustomerId] = useState('');
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
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                onOpenChange(nextOpen);

                if (!nextOpen) {
                    resetForm();
                }
            }}
        >
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Nova conta a receber</DialogTitle>
                    <DialogDescription>
                        Lance um recebimento manual sem depender de uma venda.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="grid gap-4"
                    onSubmit={(event) => {
                        event.preventDefault();

                        let hasError = false;

                        if (!customerId) {
                            setError('customer_id', {
                                type: 'required',
                                message: 'Cliente é obrigatório.',
                            });
                            hasError = true;
                        }

                        if (!item.trim()) {
                            setError('item', {
                                type: 'required',
                                message: 'Item é obrigatório.',
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
                                message: 'Data é obrigatória.',
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
                    <div className="grid gap-2">
                        <Label>Cliente <span className="text-red-600">*</span></Label>
                        <SearchableSelect
                            value={customerId}
                            searchValue={customerSearch}
                            onSearchChange={setCustomerSearch}
                            onChange={(value) => {
                                setCustomerId(value);
                                clearErrors('customer_id');
                                const selectedCustomer = customers.find(
                                    (customer) => customer.id === value,
                                );

                                setCustomerSearch(selectedCustomer?.name ?? '');
                            }}
                            options={filteredCustomers.map((customer) => ({
                                value: customer.id,
                                label: customer.name,
                            }))}
                            placeholder="Buscar cliente"
                            emptyMessage="Nenhum cliente encontrado."
                        />
                        {errors.customer_id?.message ? (
                            <p className="text-xs text-destructive">
                                {String(errors.customer_id.message)}
                            </p>
                        ) : null}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="manual-receivable-item">
                                Item *
                            </Label>
                            <Input
                                id="manual-receivable-item"
                                value={item}
                                onChange={(event) =>
                                    {
                                        setItem(event.currentTarget.value);
                                        clearErrors('item');
                                    }
                                }
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
                            <Label htmlFor="manual-receivable-amount">
                                Valor *
                            </Label>
                            <Input
                                id="manual-receivable-amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(event) =>
                                    {
                                        setAmount(event.currentTarget.value);
                                        clearErrors('amount');
                                    }
                                }
                                placeholder="0,00"
                                required
                            />
                            {errors.amount?.message ? (
                                <p className="text-xs text-destructive">
                                    {String(errors.amount.message)}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="manual-receivable-description">
                            Descricao
                        </Label>
                        <Input
                            id="manual-receivable-description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.currentTarget.value)
                            }
                            placeholder="Detalhes do lancamento"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Data <span className="text-red-600">*</span></Label>
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
    );
}
