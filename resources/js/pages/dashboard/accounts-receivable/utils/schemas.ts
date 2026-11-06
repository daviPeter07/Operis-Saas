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
        payment_method: z.enum(['cash', 'pix', 'card', 'crediario'], {
            error: MESSAGES.chooseOption,
        }),
        card_type: z.enum(['debit', 'credit']),
        installments: z.string().refine((value) => {
            const count = Number(value);

            return Number.isInteger(count) && count >= 1 && count <= 24;
        }, MESSAGES.chooseOption),
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
    // The API asks for a due date (the first installment on crediário) on or after the entry date.
    .refine(
        (values) =>
            values.due_date !== '' && values.due_date >= values.entry_date,
        {
            message: 'O vencimento precisa ser no lançamento ou depois.',
            path: ['due_date'],
        },
    );
