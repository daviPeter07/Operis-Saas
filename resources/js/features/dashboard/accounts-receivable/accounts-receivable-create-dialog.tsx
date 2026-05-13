import { UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { ClientCreateDialog } from '@/features/dashboard/clients/client-create-dialog';
import type { UiCustomer } from '@/types/dashboard-entities';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/form-fields';
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
    mode?: 'create' | 'edit';
    initialData?: {
        customer_id: number;
        item: string;
        description?: string | null;
        amount: number;
        entry_date: string;
    };
};

const today = todayString();

export function AccountsReceivableCreateDialog({
    open,
    onOpenChange,
    customers,
    onSubmit,
    mode = 'create',
    initialData,
}: AccountsReceivableCreateDialogProps) {
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [clientCreateOpen, setClientCreateOpen] = useState(false);
    const [clientTooltipOpen, setClientTooltipOpen] = useState(false);
    const [item, setItem] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const {
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<Record<string, string>>({ mode: 'onSubmit' });
    const isEditMode = mode === 'edit';

    useEffect(() => {
        if (open && initialData) {
            setCustomerId(String(initialData.customer_id));
            setCustomerSearch(
                customers.find(
                    (customer) =>
                        customer.id === String(initialData.customer_id),
                )?.name ?? '',
            );
            setItem(initialData.item);
            setDescription(initialData.description ?? '');
            setAmount(
                formatCurrencyInput(
                    String(Math.round(Number(initialData.amount ?? 0) * 100)),
                ),
            );
        }
    }, [customers, initialData, open]);

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
                <DialogContent className="w-[calc(100vw-2rem)]! sm:max-w-230!">
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

                            if (!amount || parseCurrencyInput(amount) <= 0) {
                                setError('amount', {
                                    type: 'required',
                                    message: 'Valor deve ser maior que zero.',
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
                                amount: parseCurrencyInput(amount),
                                entry_date: today,
                            }).then(() => {
                                resetForm();
                                onOpenChange(false);
                            });
                        }}
                    >
                        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                            <div className="col-span-1">
                                <div className="flex items-center gap-2">
                                    <Label className="mb-0">
                                        Cliente{' '}
                                        <span className="text-red-600">*</span>
                                    </Label>
                                    <Tooltip
                                        open={clientTooltipOpen}
                                        onOpenChange={setClientTooltipOpen}
                                    >
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground/50"
                                                onClick={() =>
                                                    setClientCreateOpen(true)
                                                }
                                                onFocus={(e) =>
                                                    e.preventDefault()
                                                }
                                            >
                                                <UserPlus className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Criar cliente
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
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
                                {errors.customer_id?.message ? (
                                    <p className="text-xs text-destructive">
                                        {String(errors.customer_id.message)}
                                    </p>
                                ) : null}
                            </div>

                            <div className="col-span-1">
                                <Label htmlFor="receivable-item">
                                    Item <span className="text-red-600">*</span>
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

                            <div className="col-span-1">
                                <Label htmlFor="receivable-amount">
                                    Valor{' '}
                                    <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="receivable-amount"
                                    type="text"
                                    value={amount}
                                    onChange={(event) => {
                                        setAmount(
                                            formatCurrencyInput(
                                                event.currentTarget.value,
                                            ),
                                        );
                                        clearErrors('amount');
                                    }}
                                    placeholder="R$ 0,00"
                                    required
                                />
                                {errors.amount?.message ? (
                                    <p className="text-xs text-destructive">
                                        {String(errors.amount.message)}
                                    </p>
                                ) : null}
                            </div>

                            <div className="col-span-1 sm:col-span-2">
                                <Label htmlFor="receivable-description">
                                    Descricao
                                </Label>
                                <Input
                                    id="receivable-description"
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(
                                            event.currentTarget.value,
                                        )
                                    }
                                    placeholder="Detalhes da conta"
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
                            <Button
                                type="submit"
                                disabled={
                                    !customerId || !item.trim() || !amount
                                }
                            >
                                {isEditMode ? 'Salvar conta' : 'Criar conta'}
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
