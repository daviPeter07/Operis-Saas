import { useFormContext } from 'react-hook-form';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type { ProductDialogForm } from '../../utils/types';

export function DescriptionField() {
    const form = useFormContext<ProductDialogForm>();

    return (
        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem className="sm:col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                        <Textarea
                            placeholder="Descreva o produto, diferenciais ou observações internas"
                            className="min-h-28 resize-none"
                            {...field}
                        />
                    </FormControl>
                </FormItem>
            )}
        />
    );
}
