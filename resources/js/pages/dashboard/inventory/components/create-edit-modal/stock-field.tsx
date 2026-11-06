import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { STOCK_STEPS } from '../../utils/constants';
import { toNonNegativeQuantity } from '../../utils/functions';
import type { ProductDialogForm, StockFieldProps } from '../../utils/types';
import { RequiredMark } from './required-mark';

export function StockField({ name, label }: StockFieldProps) {
    const form = useFormContext<ProductDialogForm>();

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>
                        {label} <RequiredMark />
                    </FormLabel>
                    <div className="space-y-2 rounded-lg border p-3">
                        <FormControl>
                            <Input
                                type="number"
                                min="0"
                                step="1"
                                placeholder="0"
                                {...field}
                                onChange={(event) =>
                                    field.onChange(
                                        toNonNegativeQuantity(
                                            event.currentTarget.value,
                                        ),
                                    )
                                }
                            />
                        </FormControl>
                        <FormMessage />
                        <div className="grid grid-cols-4 gap-2">
                            {STOCK_STEPS.map((step) => (
                                <Button
                                    key={step}
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                        step > 0 &&
                                            'border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
                                        step < 0 &&
                                            'border-amber-500/30 text-amber-700 dark:text-amber-300',
                                    )}
                                    onClick={() =>
                                        field.onChange(
                                            toNonNegativeQuantity(
                                                Number(field.value || 0) + step,
                                            ),
                                        )
                                    }
                                >
                                    {step > 0 ? `+${step}` : step}
                                </Button>
                            ))}
                        </div>
                    </div>
                </FormItem>
            )}
        />
    );
}
