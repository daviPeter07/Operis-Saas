import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import {
    useCreateManualAccountReceivable,
    useUpdateAccountReceivable,
} from '@/hooks/use-account-receivables';
import { useCustomers } from '@/hooks/use-customers';
import { CreateEditModal as ClientCreateEditModal } from '@/pages/dashboard/clients/components/create-edit-modal';
import { showServerErrors } from '@/utils/form-errors';
import { applyFieldMask, toFieldOptions } from '@/utils/form-fields';
import {
    RECEIVABLE_DIALOG_TEXT,
    RECEIVABLE_MESSAGES,
} from '../../utils/constants';
import {
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
    const text = RECEIVABLE_DIALOG_TEXT[receivable ? 'edit' : 'create'];

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
                    className="flex max-h-[calc(100dvh-1rem)] !w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[calc(100dvh-4rem)] sm:!max-w-[720px]"
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
