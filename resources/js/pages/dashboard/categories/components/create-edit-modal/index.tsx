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
import { useCreateCategory } from '@/hooks/use-categories';
import { useUpdateCategory } from '@/hooks/use-update-category';
import { showServerErrors } from '@/utils/form-errors';
import {
    CATEGORY_MODAL_TEXT,
    CATEGORY_NAME_PLACEHOLDER,
    SAVE_CATEGORY_ERROR,
    STATUS_OPTIONS,
} from '../../utils/constants';
import { toCategoryFormValues } from '../../utils/functions';
import { categoryFormSchema } from '../../utils/schemas';
import type { CategoryForm, CreateEditModalProps } from '../../utils/types';

export function CreateEditModal({
    open,
    onOpenChange,
    category,
}: CreateEditModalProps) {
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();
    const form = useForm<CategoryForm>({
        resolver: zodResolver(categoryFormSchema),
        mode: 'onTouched',
        defaultValues: toCategoryFormValues(category),
    });
    const text = CATEGORY_MODAL_TEXT[category ? 'edit' : 'create'];

    useEffect(() => {
        if (open) {
            form.reset(toCategoryFormValues(category));
        }
    }, [category, form, open]);

    const submit = form.handleSubmit(async (values) => {
        try {
            if (category) {
                await updateCategory.mutateAsync({
                    id: category.id,
                    ...values,
                });
            } else {
                // New categories always start active (StoreCategoryRequest has no status).
                await createCategory.mutateAsync({ name: values.name });
            }

            toast.success(text.success);
            onOpenChange(false);
        } catch (error) {
            showServerErrors(form, error, SAVE_CATEGORY_ERROR);
        }
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[calc(100vw-2rem)] sm:!max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>{text.title}</DialogTitle>
                    <DialogDescription>{text.description}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 py-4">
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
                                                placeholder={
                                                    CATEGORY_NAME_PLACEHOLDER
                                                }
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {category ? (
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
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
