import { useFormContext } from 'react-hook-form';
import {
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCurrencyInput } from '@/utils/form-fields';
import {
    CREDIT_DISABLED_TOOLTIP,
    CREDIT_ENABLED_OPTIONS,
    CREDIT_TERM_OPTIONS,
} from '../../utils/constants';
import type {
    ClientFormValues,
    CreditFieldTooltipProps,
} from '../../utils/types';

function CreditFieldTooltip({ disabled, children }: CreditFieldTooltipProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div>{children}</div>
                </TooltipTrigger>
                {disabled ? (
                    <TooltipContent>{CREDIT_DISABLED_TOOLTIP}</TooltipContent>
                ) : null}
            </Tooltip>
        </TooltipProvider>
    );
}

export function CreditFields() {
    const form = useFormContext<ClientFormValues>();
    const isCreditDisabled = form.watch('credit_enabled') === 'no';

    return (
        <>
            <FormField
                control={form.control}
                name="credit_enabled"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Crediário</FormLabel>
                        <Select
                            value={field.value === 'yes' ? '1' : '0'}
                            onValueChange={(value) => {
                                field.onChange(value === '1' ? 'yes' : 'no');
                                void form.trigger('credit_limit');
                            }}
                        >
                            <FormControl>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {CREDIT_ENABLED_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="credit_limit"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Limite do crediário</FormLabel>
                        <CreditFieldTooltip disabled={isCreditDisabled}>
                            <FormControl>
                                <Input
                                    inputMode="numeric"
                                    placeholder="R$ 0,00"
                                    {...field}
                                    disabled={isCreditDisabled}
                                    className={
                                        isCreditDisabled
                                            ? 'cursor-not-allowed'
                                            : undefined
                                    }
                                    onChange={(event) =>
                                        field.onChange(
                                            formatCurrencyInput(
                                                event.currentTarget.value,
                                            ),
                                        )
                                    }
                                />
                            </FormControl>
                        </CreditFieldTooltip>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="credit_term_days"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Prazo do crediário (dias)</FormLabel>
                        <CreditFieldTooltip disabled={isCreditDisabled}>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isCreditDisabled}
                            >
                                <FormControl>
                                    <SelectTrigger
                                        className={
                                            isCreditDisabled
                                                ? 'w-full cursor-not-allowed'
                                                : 'w-full'
                                        }
                                    >
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {CREDIT_TERM_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CreditFieldTooltip>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}
