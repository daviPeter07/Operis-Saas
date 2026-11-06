import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/use-suppliers';
import { showServerErrors } from '@/utils/form-errors';
import {
    SAVE_SUPPLIER_ERROR,
    SUPPLIER_DIALOG_TEXT,
} from '../../utils/constants';
import {
    toSupplierFormValues,
    toSupplierSubmitData,
} from '../../utils/functions';
import { supplierFormSchema } from '../../utils/schemas';
import type {
    SupplierCreateDialogProps,
    SupplierFormValues,
} from '../../utils/types';
import { SupplierFields } from './supplier-fields';

// Also used by the purchase and accounts payable dialogs to create a supplier on the spot.
export function SupplierCreateDialog({
    open,
    onOpenChange,
    onSuccess,
    supplier,
}: SupplierCreateDialogProps) {
    const createSupplier = useCreateSupplier();
    const updateSupplier = useUpdateSupplier();
    const form = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierFormSchema),
        mode: 'onTouched',
        defaultValues: toSupplierFormValues(supplier),
    });
    const text = SUPPLIER_DIALOG_TEXT[supplier ? 'edit' : 'create'];

    useEffect(() => {
        if (open) {
            form.reset(toSupplierFormValues(supplier));
        }
    }, [form, open, supplier]);

    const submit = form.handleSubmit(async (values) => {
        const data = toSupplierSubmitData(values);

        try {
            const saved = supplier
                ? await updateSupplier.mutateAsync({ id: supplier.id, data })
                : await createSupplier.mutateAsync(data);

            onOpenChange(false);
            onSuccess?.(saved);
        } catch (error) {
            showServerErrors(form, error, SAVE_SUPPLIER_ERROR);
        }
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[calc(100vw-2rem)] sm:!max-w-[920px]">
                <DialogHeader>
                    <DialogTitle>{text.title}</DialogTitle>
                    <DialogDescription>{text.description}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={submit} className="space-y-4">
                        <SupplierFields />

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
                                    !form.formState.isValid ||
                                    form.formState.isSubmitting
                                }
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
