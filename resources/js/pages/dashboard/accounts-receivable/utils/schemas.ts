import { z } from 'zod';
import { VALIDATION_MESSAGES as MESSAGES } from '@/constants/validation-messages';
import { parseCurrencyInput } from '@/utils/form-fields';
import { maxLengthMessage } from '@/utils/validation';
import { RECEIVABLE_LIMITS } from './constants';

// Mirrors StoreAccountReceivableRequest / UpdateAccountReceivableRequest.
export const receivableFormSchema = z.object({
    customer_id: z.string().min(1, MESSAGES.chooseOption),
    item: z
        .string()
        .trim()
        .min(1, MESSAGES.required)
        .max(
            RECEIVABLE_LIMITS.itemLength,
            maxLengthMessage(RECEIVABLE_LIMITS.itemLength),
        ),
    amount: z
        .string()
        .refine(
            (value) => parseCurrencyInput(value) > 0,
            'Informe um valor maior que zero.',
        ),
    entry_date: z.string().min(1, MESSAGES.required),
    description: z
        .string()
        .trim()
        .max(
            RECEIVABLE_LIMITS.descriptionLength,
            maxLengthMessage(RECEIVABLE_LIMITS.descriptionLength),
        ),
});
