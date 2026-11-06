import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
import { useCreateService, useUpdateService } from '@/hooks/use-services';
import { showServerErrors } from '@/utils/form-errors';
import { applyFieldMask } from '@/utils/form-fields';
import {
    COST_TOOLTIP,
    SAVE_SERVICE_ERROR,
    SERVICE_MODAL_TEXT,
    SERVICE_PLACEHOLDERS,
    STATUS_OPTIONS,
} from '../../utils/constants';
import { toServiceFormValues, toServicePayload } from '../../utils/functions';
import { serviceFormSchema } from '../../utils/schemas';
import type { CreateEditModalProps, ServiceForm } from '../../utils/types';

export function CreateEditModal({
    open,
    onOpenChange,
    service,
    initialName,
    onCreated,
}: CreateEditModalProps) {
    const createService = useCreateService();
    const updateService = useUpdateService();
    const form = useForm<ServiceForm>({
        resolver: zodResolver(serviceFormSchema),
        mode: 'onTouched',
        defaultValues: toServiceFormValues(service, initialName),
    });
    const text = SERVICE_MODAL_TEXT[service ? 'edit' : 'create'];

    useEffect(() => {
        if (open) {
            form.reset(toServiceFormValues(service, initialName));
        }
    }, [form, initialName, open, service]);

    const submit = form.handleSubmit(async (values) => {
        try {
            if (service) {
                await updateService.mutateAsync({
                    id: service.id,
                    ...toServicePayload(values),
                });
            } else {
                const created = await createService.mutateAsync({
                    ...toServicePayload(values),
                    status: 'active',
                });
                onCreated?.(created);
            }

            toast.success(text.success);
            onOpenChange(false);
        } catch (error) {
            showServerErrors(form, error, SAVE_SERVICE_ERROR);
        }
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[calc(100vw-2rem)] sm:!max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>{text.title}</DialogTitle>
                    <DialogDescription>{text.description}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>
                                            Nome <RequiredMark />
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={
                                                    SERVICE_PLACEHOLDERS.name
                                                }
                                                {...field}
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
                                        <FormLabel>Descrição</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={
                                                    SERVICE_PLACEHOLDERS.description
                                                }
                                                className="min-h-24 resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Valor <RequiredMark />
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="R$ 0,00"
                                                {...field}
                                                onChange={(event) =>
                                                    field.onChange(
                                                        applyFieldMask(
                                                            event.currentTarget
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
                                name="cost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel tooltip={COST_TOOLTIP}>
                                            Custo
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="Sem custo"
                                                {...field}
                                                onChange={(event) =>
                                                    field.onChange(
                                                        applyFieldMask(
                                                            event.currentTarget
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

                            {service ? (
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2">
                                            <FormLabel>
                                                Status <RequiredMark />
                                            </FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger
                                                        className="w-full"
                                                        onBlur={field.onBlur}
                                                    >
                                                        <SelectValue placeholder="Selecione status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {STATUS_OPTIONS.map(
                                                        (option) => (
                                                            <SelectItem
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                            >
                                                                {option.label}
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
    );
}
