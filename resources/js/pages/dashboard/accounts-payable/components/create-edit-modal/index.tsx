import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { DatePickerInput } from '@/components/date/date-picker-input';
import {
    InputSearchComplete,
    keepDialogOpenWhileSearchListOpen,
} from '@/components/input-search-complete';
import { RequiredMark } from '@/components/required-mark';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    useCreateManualAccountPayable,
    useUpdateAccountPayable,
} from '@/hooks/use-account-payables';
import { useSuppliers } from '@/hooks/use-suppliers';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import { CreateEditModal as SupplierCreateEditModal } from '@/pages/dashboard/suppliers/components/create-edit-modal';
import { showServerErrors } from '@/utils/form-errors';
import {
    applyFieldMask,
    parseCurrencyInput,
    toFieldOptions,
} from '@/utils/form-fields';
import {
    BOLETO_TERMS,
    MANUAL_PAYMENT_OPTIONS,
    MANUAL_STATUS_OPTIONS,
    PAYABLE_DIALOG_TEXT,
    PAYABLE_MESSAGES,
} from '../../utils/constants';
import {
    splitManualBoletos,
    toPayableFormValues,
    toPayableSubmitData,
} from '../../utils/functions';
import { payableFormSchema } from '../../utils/schemas';
import type {
    CreateEditModalProps,
    PayableFormValues,
} from '../../utils/types';

export function CreateEditModal({
    open,
    onOpenChange,
    payable,
}: CreateEditModalProps) {
    const { data: suppliers = [] } = useSuppliers();
    const createPayable = useCreateManualAccountPayable();
    const updatePayable = useUpdateAccountPayable();
    const [newSupplierName, setNewSupplierName] = useState<string | null>(null);
    const form = useForm<PayableFormValues>({
        resolver: zodResolver(payableFormSchema),
        mode: 'onTouched',
        defaultValues: toPayableFormValues(payable),
    });
    const isEdit = Boolean(payable);
    const text = PAYABLE_DIALOG_TEXT[isEdit ? 'edit' : 'create'];
    const [paymentMethod, boletoTerm, amount, entryDate] = useWatch({
        control: form.control,
        name: ['payment_method', 'boleto_term_days', 'amount', 'entry_date'],
    });
    // Payment method, boletos and status only apply when the account is created.
    const isBoleto = !isEdit && paymentMethod === 'boleto';
    const boletos = isBoleto
        ? splitManualBoletos(
              parseCurrencyInput(amount),
              Number(boletoTerm),
              entryDate,
          )
        : [];

    useEffect(() => {
        if (open) {
            form.reset(toPayableFormValues(payable));
        }
    }, [form, open, payable]);

    const submit = form.handleSubmit(async (values) => {
        const data = toPayableSubmitData(values);

        try {
            if (payable) {
                await updatePayable.mutateAsync({ id: payable.id, data });
            } else {
                await createPayable.mutateAsync(data);
            }

            toast.success(text.success);
            onOpenChange(false);
        } catch (error) {
            showServerErrors(form, error, PAYABLE_MESSAGES.saveError);
        }
    });

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className="flex max-h-[calc(100dvh-1rem)] !w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[calc(100dvh-4rem)] sm:!max-w-[760px]"
                    onEscapeKeyDown={keepDialogOpenWhileSearchListOpen}
                >
                    <DialogHeader className="border-b px-4 py-4 pr-12 text-left sm:px-6">
                        <DialogTitle>{text.title}</DialogTitle>
                        <DialogDescription>
                            {text.description}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={submit}
                            className="flex min-h-0 flex-1 flex-col"
                        >
                            <div className="grid min-h-0 flex-1 content-start gap-4 overflow-y-auto px-4 py-4 sm:grid-cols-2 sm:px-6 sm:py-5">
                                <FormField
                                    control={form.control}
                                    name="supplier_id"
                                    render={({ field, fieldState }) => (
                                        <FormItem className="sm:col-span-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <FormLabel>
                                                    Fornecedor <RequiredMark />
                                                </FormLabel>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 gap-1.5 text-muted-foreground"
                                                    onClick={() =>
                                                        setNewSupplierName('')
                                                    }
                                                >
                                                    <UserPlus className="size-4" />
                                                    Novo fornecedor
                                                </Button>
                                            </div>
                                            <FormControl>
                                                <InputSearchComplete
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    options={toFieldOptions(
                                                        suppliers,
                                                    )}
                                                    ariaLabel="Fornecedor"
                                                    placeholder="Buscar fornecedor pelo nome"
                                                    emptyMessage="Nenhum fornecedor encontrado."
                                                    invalid={Boolean(
                                                        fieldState.error,
                                                    )}
                                                    onCreateOption={(name) =>
                                                        setNewSupplierName(name)
                                                    }
                                                    createOptionLabel={(name) =>
                                                        `Cadastrar "${name}"`
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="item"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2">
                                            <FormLabel>
                                                Descrição <RequiredMark />
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex.: aluguel da loja"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Valor <RequiredMark />
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    inputMode="numeric"
                                                    placeholder="R$ 0,00"
                                                    {...field}
                                                    onChange={(event) =>
                                                        field.onChange(
                                                            applyFieldMask(
                                                                event
                                                                    .currentTarget
                                                                    .value,
                                                                'currency',
                                                            ),
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="entry_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Lançamento <RequiredMark />
                                            </FormLabel>
                                            <FormControl>
                                                <DatePickerInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Selecionar data"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {isEdit ? null : (
                                    <>
                                        <FormField
                                            control={form.control}
                                            name="payment_method"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Forma de pagamento
                                                    </FormLabel>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {MANUAL_PAYMENT_OPTIONS.map(
                                                                (option) => (
                                                                    <SelectItem
                                                                        key={
                                                                            option.value
                                                                        }
                                                                        value={
                                                                            option.value
                                                                        }
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Situação
                                                    </FormLabel>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {MANUAL_STATUS_OPTIONS.map(
                                                                (option) => (
                                                                    <SelectItem
                                                                        key={
                                                                            option.value
                                                                        }
                                                                        value={
                                                                            option.value
                                                                        }
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </>
                                )}

                                {isBoleto ? (
                                    <FormField
                                        control={form.control}
                                        name="boleto_term_days"
                                        render={({ field }) => (
                                            <FormItem className="sm:col-span-2">
                                                <FormLabel>Boletos</FormLabel>
                                                <div
                                                    role="radiogroup"
                                                    aria-label="Quantidade de boletos"
                                                    className="grid grid-cols-5 gap-2"
                                                >
                                                    {BOLETO_TERMS.map(
                                                        (term) => {
                                                            const count =
                                                                term / 30;
                                                            const isSelected =
                                                                field.value ===
                                                                String(term);

                                                            return (
                                                                <button
                                                                    key={term}
                                                                    type="button"
                                                                    role="radio"
                                                                    aria-checked={
                                                                        isSelected
                                                                    }
                                                                    onClick={() =>
                                                                        field.onChange(
                                                                            String(
                                                                                term,
                                                                            ),
                                                                        )
                                                                    }
                                                                    className={
                                                                        isSelected
                                                                            ? 'cursor-pointer rounded-lg border border-accent bg-accent/10 py-2 text-center'
                                                                            : 'cursor-pointer rounded-lg border py-2 text-center hover:bg-muted'
                                                                    }
                                                                >
                                                                    <span className="block text-lg leading-none font-black">
                                                                        {count}
                                                                    </span>
                                                                    <span className="text-[11px] text-muted-foreground">
                                                                        {count ===
                                                                        1
                                                                            ? 'boleto'
                                                                            : 'boletos'}
                                                                    </span>
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                                <ul className="divide-y rounded-lg border text-sm">
                                                    {boletos.map((boleto) => (
                                                        <li
                                                            key={boleto.number}
                                                            className="flex items-center justify-between gap-3 px-3 py-2"
                                                        >
                                                            <span className="text-muted-foreground">
                                                                {boleto.number}º
                                                                boleto · vence{' '}
                                                                {formatDateBR(
                                                                    boleto.dueDate,
                                                                )}
                                                            </span>
                                                            <span className="font-medium tabular-nums">
                                                                {formatCurrencyBR(
                                                                    boleto.amount,
                                                                )}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <p className="text-xs text-muted-foreground">
                                                    Um boleto por mês, a partir
                                                    da data de lançamento.
                                                </p>
                                            </FormItem>
                                        )}
                                    />
                                ) : (
                                    <FormField
                                        control={form.control}
                                        name="due_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Vencimento <RequiredMark />
                                                </FormLabel>
                                                <FormControl>
                                                    <DatePickerInput
                                                        value={field.value}
                                                        onChange={
                                                            field.onChange
                                                        }
                                                        placeholder="Selecionar data"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2">
                                            <FormLabel>Observações</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Opcional"
                                                    className="min-h-24 resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter className="flex-row gap-2 border-t px-4 py-3 sm:px-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 sm:flex-none"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 sm:flex-none"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting
                                        ? 'Salvando...'
                                        : text.submit}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <SupplierCreateEditModal
                open={newSupplierName !== null}
                onOpenChange={(isOpen) => !isOpen && setNewSupplierName(null)}
                initialName={newSupplierName ?? ''}
                onSuccess={(supplier) =>
                    form.setValue('supplier_id', String(supplier.id), {
                        shouldValidate: true,
                    })
                }
            />
        </>
    );
}
