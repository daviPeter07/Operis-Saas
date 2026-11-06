import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/use-customers';
import { showServerErrors } from '@/utils/form-errors';
import { SAVE_CLIENT_ERROR } from '../../utils/constants';
import { toClientFormValues, toClientSubmitData } from '../../utils/functions';
import { clientFormSchema } from '../../utils/schemas';
import type { ClientFormProps, ClientFormValues } from '../../utils/types';
import { CreditFields } from './credit-fields';
import { IdentificationFields } from './identification-fields';

// Mounted each time the dialog opens, so it always starts from initialData.
export function ClientForm({
    initialData,
    text,
    onCancel,
    onSaved,
}: ClientFormProps) {
    const createCustomer = useCreateCustomer();
    const updateCustomer = useUpdateCustomer();
    const editingId = initialData?.id;
    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientFormSchema),
        mode: 'onTouched',
        defaultValues: toClientFormValues(initialData),
    });

    const submit = form.handleSubmit(async (values) => {
        const data = toClientSubmitData(values);

        try {
            const customer = editingId
                ? await updateCustomer.mutateAsync({ id: editingId, data })
                : await createCustomer.mutateAsync(data);

            onSaved({ id: customer.id, name: customer.name });
        } catch (error) {
            showServerErrors(form, error, SAVE_CLIENT_ERROR);
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <IdentificationFields />
                    <CreditFields />
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onCancel}>
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
                            ? text.submitting
                            : text.submit}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}
