import { useFormContext } from 'react-hook-form';
import { RequiredMark } from '@/components/required-mark';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { applyFieldMask } from '@/utils/form-fields';
import { COST_TOOLTIP, SALE_PRICE_TOOLTIP } from '../../utils/constants';
import type { ProductDialogForm } from '../../utils/types';

export function PriceFields() {
    const form = useFormContext<ProductDialogForm>();

    return (
        <>
            <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel tooltip={COST_TOOLTIP}>
                            Preço de custo <RequiredMark />
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
                                            event.currentTarget.value,
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
                name="sale_price"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel tooltip={SALE_PRICE_TOOLTIP}>
                            Preço de venda <RequiredMark />
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
                                            event.currentTarget.value,
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
        </>
    );
}
