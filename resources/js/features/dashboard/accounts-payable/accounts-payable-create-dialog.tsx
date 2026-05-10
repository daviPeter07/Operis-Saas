import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Truck } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/form-fields';
import type { AccountsPayableCreateDialogProps } from '@/types/dashboard-forms';
import { todayString } from '@/utils/sales-dialog';
import { SupplierCreateDialog } from '../suppliers/supplier-create-dialog';

const today = todayString();

export function AccountsPayableCreateDialog({
    open,
    onOpenChange,
    onSubmit,
    suppliers,
    onCreateSupplier,
}: AccountsPayableCreateDialogProps) {
    const [supplierCreateOpen, setSupplierCreateOpen] = useState(false);
    const [supplierSearch, setSupplierSearch] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [supplierTooltipOpen, setSupplierTooltipOpen] = useState(false);
    const [item, setItem] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState(today);
    const [status, setStatus] = useState<'pending' | 'paid'>('pending');
    const [paymentMethod, setPaymentMethod] = useState<
        'cash' | 'pix' | 'card' | 'installment' | 'boleto'
    >('pix');
    const {
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<Record<string, string>>({ mode: 'onSubmit' });

    const filteredSuppliers = useMemo(() => {
        const normalizedQuery = supplierSearch.trim().toLowerCase();

        if (!normalizedQuery) {
            return suppliers;
        }

        return suppliers.filter((supplier) =>
            supplier.name.toLowerCase().includes(normalizedQuery),
        );
    }, [supplierSearch, suppliers]);

    const resetForm = () => {
        setSupplierSearch('');
        setSupplierId('');
        setItem('');
        setDescription('');
        setAmount('');
        setDueDate(today);
        setStatus('pending');
        setPaymentMethod('pix');
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
                        <DialogTitle>Nova conta a pagar</DialogTitle>
                        <DialogDescription>
                            Preencha os dados principais da conta manual.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();

                            let hasError = false;

                            if (!supplierId) {
                                setError('supplier_id', {
                                    type: 'required',
                                    message: 'Fornecedor e obrigatorio.',
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

                            if (!dueDate) {
                                setError('due_date', {
                                    type: 'required',
                                    message: 'Vencimento e obrigatorio.',
                                });
                                hasError = true;
                            }

                            if (hasError) {
                                return;
                            }

                            onSubmit({
                                supplier_id: Number(supplierId),
                                item: item.trim(),
                                description: description.trim() || undefined,
                                amount: parseCurrencyInput(amount),
                                entry_date: today,
                                due_date: dueDate,
                                payment_method: paymentMethod,
                                status,
                            });

                            resetForm();
                            onOpenChange(false);
                        }}
                    >
                        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                            <div className="col-span-1">
                                <div className="flex items-center gap-2">
                                    <Label className="mb-0">
                                        Fornecedor <span className="text-red-600">*</span>
                                    </Label>
                                    <Tooltip open={supplierTooltipOpen} onOpenChange={setSupplierTooltipOpen}>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground/50"
                                                onClick={() => setSupplierCreateOpen(true)}
                                                onFocus={(e) => e.preventDefault()}
                                            >
                                                <Truck className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Criar fornecedor</TooltipContent>
                                    </Tooltip>
                                </div>
                                <SearchableSelect
                                    value={supplierId}
                                    searchValue={supplierSearch}
                                    onSearchChange={setSupplierSearch}
                                    onChange={(value) => {
                                        setSupplierId(value);
                                        clearErrors('supplier_id');
                                        const selectedSupplier = suppliers.find(
                                            (supplier) =>
                                                supplier.id === value,
                                        );

                                        setSupplierSearch(
                                            selectedSupplier?.name ?? '',
                                        );
                                    }}
                                    options={filteredSuppliers.map(
                                        (supplier) => ({
                                            value: supplier.id,
                                            label: supplier.name,
                                        }),
                                    )}
                                    placeholder="Buscar fornecedor"
                                    emptyMessage="Nenhum fornecedor encontrado."
                                />

                                {errors.supplier_id?.message ? (
                                    <p className="text-xs text-destructive">
                                        {String(errors.supplier_id.message)}
                                    </p>
                                ) : null}
                            </div>

                            <div className="col-span-1">
                                <Label htmlFor="payable-item">
                                    Item <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="payable-item"
                                    value={item}
                                    onChange={(event) => {
                                        setItem(event.currentTarget.value);
                                        clearErrors('item');
                                    }}
                                    placeholder="Ex.: pagamento de frete"
                                    required
                                />
                                {errors.item?.message ? (
                                    <p className="text-xs text-destructive">
                                        {String(errors.item.message)}
                                    </p>
                                ) : null}
                            </div>

                            <div className="col-span-1">
                                <Label htmlFor="payable-amount">
                                    Valor <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="payable-amount"
                                    type="text"
                                    value={amount}
                                    onChange={(event) => {
                                        setAmount(formatCurrencyInput(event.currentTarget.value));
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

                            <div className="col-span-1">
                                <Label>Vencimento <span className="text-red-600">*</span></Label>
                                <DatePickerInput
                                    value={dueDate}
                                    onChange={(value) => {
                                        setDueDate(value);
                                        clearErrors('due_date');
                                    }}
                                    placeholder="Selecionar data"
                                />
                                {errors.due_date?.message ? (
                                    <p className="text-xs text-destructive">
                                        {String(errors.due_date.message)}
                                    </p>
                                ) : null}
                            </div>

                            <div className="col-span-1">
                                <Label htmlFor="payable-method">Metodo</Label>
                                <Select
                                    value={paymentMethod}
                                    onValueChange={(value) => {
                                        if (
                                            value === 'cash' ||
                                            value === 'pix' ||
                                            value === 'card' ||
                                            value === 'installment' ||
                                            value === 'boleto'
                                        ) {
                                            setPaymentMethod(value);
                                        }
                                    }}
                                >
                                    <SelectTrigger id="payable-method">
                                        <SelectValue placeholder="Metodo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Dinheiro</SelectItem>
                                        <SelectItem value="pix">PIX</SelectItem>
                                        <SelectItem value="card">Cartao</SelectItem>
                                        <SelectItem value="installment">
                                            Parcelado
                                        </SelectItem>
                                        <SelectItem value="boleto">Boleto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-span-1">
                                <Label htmlFor="payable-status">Status</Label>
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
                                        <SelectItem value="pending">Pendente</SelectItem>
                                        <SelectItem value="paid">Pago</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-span-1 sm:col-span-2">
                                <Label htmlFor="payable-description">Descricao</Label>
                                <Input
                                    id="payable-description"
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(event.currentTarget.value)
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
                                disabled={!supplierId || !item.trim() || !amount}
                            >
                                Salvar conta
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

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
                        createdAt: today,
                    }).then((supplier) => {
                        setSupplierId(supplier.id);
                        setSupplierSearch(supplier.name);
                    });
                }}
            />
        </>
    );
}
