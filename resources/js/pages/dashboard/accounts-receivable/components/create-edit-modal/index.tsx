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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    useCreateManualAccountReceivable,
    useUpdateAccountReceivable,
} from '@/hooks/use-account-receivables';
import { useCustomers } from '@/hooks/use-customers';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import { CreateEditModal as ClientCreateEditModal } from '@/pages/dashboard/clients/components/create-edit-modal';
import { showServerErrors } from '@/utils/form-errors';
import {
    applyFieldMask,
    parseCurrencyInput,
    toFieldOptions,
} from '@/utils/form-fields';
import {
    CARD_TYPE_OPTIONS,
    CREDIARIO_FIRST_DUE_DAYS,
    CREDIARIO_INSTALLMENT_OPTIONS,
    MANUAL_PAYMENT_OPTIONS,
    MANUAL_STATUS_OPTIONS,
    RECEIVABLE_DIALOG_TEXT,
    RECEIVABLE_MESSAGES,
} from '../../utils/constants';
import {
    addDaysToDate,
    splitCrediario,
    toNewClientData,
    toReceivableFormValues,
    toReceivableSubmitData,
} from '../../utils/functions';
import { receivableFormSchema } from '../../utils/schemas';
import type {
    CreateEditModalProps,
    ReceivableFormValues,
} from '../../utils/types';

export function CreateEditModal({
    open,
    onOpenChange,
    receivable,
}: CreateEditModalProps) {
    const { data: customers = [] } = useCustomers();
    const createReceivable = useCreateManualAccountReceivable();
    const updateReceivable = useUpdateAccountReceivable();
    const [newClientName, setNewClientName] = useState<string | null>(null);
    const form = useForm<ReceivableFormValues>({
        resolver: zodResolver(receivableFormSchema),
        mode: 'onTouched',
        defaultValues: toReceivableFormValues(receivable),
    });
    const isEdit = Boolean(receivable);
    const text = RECEIVABLE_DIALOG_TEXT[isEdit ? 'edit' : 'create'];
    const [paymentMethod, installments, amount, entryDate, dueDate] = useWatch({
        control: form.control,
        name: [
            'payment_method',
            'installments',
            'amount',
            'entry_date',
            'due_date',
        ],
    });
    // Payment method, installments and status only apply when the account is created.
    const isCrediario = !isEdit && paymentMethod === 'crediario';
    const crediarioInstallments = isCrediario
        ? splitCrediario(
              parseCurrencyInput(amount),
              Number(installments),
              dueDate,
          )
        : [];

    const changePaymentMethod = (value: string) => {
        const option = MANUAL_PAYMENT_OPTIONS.find(
            (candidate) => candidate.value === value,
        );

        if (!option) {
            return;
        }

        form.setValue('payment_method', option.value, { shouldDirty: true });

        // Like a sale, the first crediário installment defaults to 30 days after the entry.
        if (option.value === 'crediario' && dueDate <= entryDate) {
            form.setValue(
                'due_date',
                addDaysToDate(entryDate, CREDIARIO_FIRST_DUE_DAYS),
                { shouldValidate: true },
            );
        }
    };

    useEffect(() => {
        if (open) {
            form.reset(toReceivableFormValues(receivable));
        }
    }, [form, open, receivable]);

    const submit = form.handleSubmit(async (values) => {
        const data = toReceivableSubmitData(values);

        try {
            if (receivable) {
                await updateReceivable.mutateAsync({ id: receivable.id, data });
            } else {
                await createReceivable.mutateAsync(data);
            }

            toast.success(text.success);
            onOpenChange(false);
        } catch (error) {
            showServerErrors(form, error, RECEIVABLE_MESSAGES.saveError);
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
                                    name="customer_id"
                                    render={({ field, fieldState }) => (
                                        <FormItem className="sm:col-span-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <FormLabel>
                                                    Cliente <RequiredMark />
                                                </FormLabel>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 gap-1.5 text-muted-foreground"
                                                    onClick={() =>
                                                        setNewClientName('')
                                                    }
                                                >
                                                    <UserPlus className="size-4" />
                                                    Novo cliente
                                                </Button>
                                            </div>
                                            <FormControl>
                                                <InputSearchComplete
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    options={toFieldOptions(
                                                        customers,
                                                    )}
                                                    ariaLabel="Cliente"
                                                    placeholder="Buscar cliente pelo nome"
                                                    emptyMessage="Nenhum cliente encontrado."
                                                    invalid={Boolean(
                                                        fieldState.error,
                                                    )}
                                                    onCreateOption={(name) =>
                                                        setNewClientName(name)
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
                                                    placeholder="Ex.: conserto de notebook"
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
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>
                                            Forma de pagamento
                                        </FormLabel>
                                        <ToggleGroup
                                            type="single"
                                            value={paymentMethod}
                                            onValueChange={changePaymentMethod}
                                            aria-label="Forma de pagamento"
                                            className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4"
                                        >
                                            {MANUAL_PAYMENT_OPTIONS.map(
                                                ({
                                                    value,
                                                    label,
                                                    hint,
                                                    icon: Icon,
                                                }) => (
                                                    <ToggleGroupItem
                                                        key={value}
                                                        value={value}
                                                        variant="outline"
                                                        className="flex h-auto flex-col items-center gap-1 rounded-xl border px-2 py-3"
                                                    >
                                                        <Icon
                                                            aria-hidden
                                                            className="size-5"
                                                        />
                                                        <span className="text-sm font-semibold">
                                                            {label}
                                                        </span>
                                                        <span className="text-[11px] font-normal opacity-75">
                                                            {hint}
                                                        </span>
                                                    </ToggleGroupItem>
                                                ),
                                            )}
                                        </ToggleGroup>
                                    </FormItem>
                                )}

                                {!isEdit && paymentMethod === 'card' ? (
                                    <FormField
                                        control={form.control}
                                        name="card_type"
                                        render={({ field }) => (
                                            <FormItem className="sm:col-span-2">
                                                <FormLabel>
                                                    Tipo no cartão
                                                </FormLabel>
                                                <ToggleGroup
                                                    type="single"
                                                    value={field.value}
                                                    onValueChange={(value) => {
                                                        if (
                                                            value === 'debit' ||
                                                            value === 'credit'
                                                        ) {
                                                            field.onChange(
                                                                value,
                                                            );
                                                        }
                                                    }}
                                                    className="grid grid-cols-2 gap-2"
                                                >
                                                    {CARD_TYPE_OPTIONS.map(
                                                        (option) => (
                                                            <ToggleGroupItem
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                                variant="outline"
                                                                className="rounded-md border"
                                                            >
                                                                {option.label}
                                                            </ToggleGroupItem>
                                                        ),
                                                    )}
                                                </ToggleGroup>
                                            </FormItem>
                                        )}
                                    />
                                ) : null}

                                {isCrediario ? (
                                    <FormField
                                        control={form.control}
                                        name="installments"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Parcelas</FormLabel>
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
                                                        {CREDIARIO_INSTALLMENT_OPTIONS.map(
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
                                ) : null}

                                <FormField
                                    control={form.control}
                                    name="due_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {isCrediario
                                                    ? '1ª parcela'
                                                    : 'Vencimento'}{' '}
                                                <RequiredMark />
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

                                {isEdit || isCrediario ? null : (
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Situação</FormLabel>
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
                                )}

                                {crediarioInstallments.length > 0 ? (
                                    <div className="grid gap-2 sm:col-span-2">
                                        <ul className="divide-y rounded-lg border text-sm">
                                            {crediarioInstallments.map(
                                                (installment) => (
                                                    <li
                                                        key={installment.number}
                                                        className="flex items-center justify-between gap-3 px-3 py-2"
                                                    >
                                                        <span className="text-muted-foreground">
                                                            Parcela{' '}
                                                            {installment.number}
                                                            /
                                                            {
                                                                crediarioInstallments.length
                                                            }{' '}
                                                            · vence{' '}
                                                            {formatDateBR(
                                                                installment.dueDate,
                                                            )}
                                                        </span>
                                                        <span className="font-medium tabular-nums">
                                                            {formatCurrencyBR(
                                                                installment.amount,
                                                            )}
                                                        </span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                        <p className="text-xs text-muted-foreground">
                                            Uma parcela por mês a partir da 1ª.
                                            Elas ficam em aberto até o cliente
                                            pagar, como no crediário da venda.
                                        </p>
                                    </div>
                                ) : null}

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

            <ClientCreateEditModal
                open={newClientName !== null}
                onOpenChange={(isOpen) => !isOpen && setNewClientName(null)}
                initialData={toNewClientData(newClientName ?? '')}
                onSuccess={(client) =>
                    form.setValue('customer_id', String(client.id), {
                        shouldValidate: true,
                    })
                }
            />
        </>
    );
}
