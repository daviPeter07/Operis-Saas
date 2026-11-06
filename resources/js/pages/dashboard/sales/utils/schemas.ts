import { z } from 'zod';
import { VALIDATION_MESSAGES as MESSAGES } from '@/constants/validation-messages';
import { formatCurrencyBR } from '@/lib/format';
import { maxLengthMessage } from '@/utils/validation';
import { SALE_LIMITS, SALE_MESSAGES } from './constants';

export const notesSchema = z
    .string()
    .max(SALE_LIMITS.notesLength, maxLengthMessage(SALE_LIMITS.notesLength));

export function makeDiscountSchema(subtotal: number) {
    return z
        .object({
            type: z.enum(['amount', 'percent']),
            value: z.number().min(0, MESSAGES.notNegative),
        })
        .refine(
            (discount) => discount.type !== 'percent' || discount.value <= 100,
            {
                message: SALE_MESSAGES.discountPercent,
                path: ['value'],
            },
        )
        .refine(
            (discount) =>
                discount.type !== 'amount' || discount.value <= subtotal,
            {
                message: `${SALE_MESSAGES.discountAmount} (${formatCurrencyBR(subtotal)})`,
                path: ['value'],
            },
        );
}

// The crediário entry is paid now; the rest is split into installments.
export function makeCrediarioEntrySchema(total: number) {
    return z
        .number()
        .gt(0, SALE_MESSAGES.entryRequired)
        .lt(
            total,
            `${SALE_MESSAGES.entryTooHigh} (${formatCurrencyBR(total)})`,
        );
}
