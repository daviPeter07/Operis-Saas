import { z } from 'zod';
import { VALIDATION_MESSAGES as MESSAGES } from '@/constants/validation-messages';
import { parseCurrencyInput } from '@/utils/form-fields';
import { maxLengthMessage } from '@/utils/validation';
import { RECEIVABLE_LIMITS } from './constants';

// Mirrors StoreAccountReceivableRequest / UpdateAccountReceivableRequest.
export const receivableFormSchema = z
    .object({
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
        due_date: z.string(),
        payment_method: z.enum(['cash', 'pix', 'card', 'boleto'], {
            error: MESSAGES.chooseOption,
        }),
        boleto_term_days: z.enum(['30', '60', '90', '120', '150'], {
            error: MESSAGES.chooseOption,
        }),
        status: z.enum(['pending', 'received'], {
            error: MESSAGES.chooseOption,
        }),
        description: z
            .string()
            .trim()
            .max(
                RECEIVABLE_LIMITS.descriptionLength,
                maxLengthMessage(RECEIVABLE_LIMITS.descriptionLength),
            ),
    })
    // The API asks for a due date on or after the entry date (a boleto computes its own).
    .refine(
        (values) =>
            values.payment_method === 'boleto' ||
            (values.due_date !== '' && values.due_date >= values.entry_date),
        {
            message: 'O vencimento precisa ser no lançamento ou depois.',
            path: ['due_date'],
        },
    );
