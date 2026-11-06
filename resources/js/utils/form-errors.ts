import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import type { ServerValidationError } from '@/types';

export function showServerErrors<TForm extends FieldValues>(
    form: UseFormReturn<TForm>,
    error: unknown,
    fallbackMessage: string,
): void {
    const { message, errors } = (error ?? {}) as ServerValidationError;
    const fields = Object.keys(form.getValues());

    Object.entries(errors ?? {}).forEach(([field, messages]) => {
        if (fields.includes(field)) {
            form.setError(field as Path<TForm>, { message: messages[0] });
        }
    });

    toast.error(message || fallbackMessage);
}
