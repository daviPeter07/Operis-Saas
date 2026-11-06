import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { showServerErrors } from '@/utils/form-errors';
import { QUICK_CREATE_TEXT } from '../../utils/constants';
import { quickCreateSchema } from '../../utils/schemas';
import type {
    QuickCreateDialogProps,
    QuickCreateForm,
} from '../../utils/types';

export function QuickCreateDialog({
    type,
    initialName,
    onClose,
    onCreate,
}: QuickCreateDialogProps) {
    const form = useForm<QuickCreateForm>({
        resolver: zodResolver(quickCreateSchema),
        mode: 'onTouched',
        defaultValues: { name: '' },
    });

    useEffect(() => {
        if (type) {
            form.reset({ name: initialName });
        }
    }, [form, initialName, type]);

    const name = useWatch({ control: form.control, name: 'name' });
    const text = QUICK_CREATE_TEXT[type ?? 'category'];

    const submit = form.handleSubmit(async (values) => {
        if (!type) {
            return;
        }

        try {
            await onCreate(type, values.name);
        } catch (error) {
            showServerErrors(form, error, text.error);
        }
    });

    return (
        <Dialog
            open={type !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{text.title}</DialogTitle>
                    <DialogDescription>{text.description}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={submit} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Nome <RequiredMark />
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={text.placeholder}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    !name.trim() || form.formState.isSubmitting
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
