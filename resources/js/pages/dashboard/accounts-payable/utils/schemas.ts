import { z } from 'zod';
import { VALIDATION_MESSAGES as MESSAGES } from '@/constants/validation-messages';
import { parseCurrencyInput } from '@/utils/form-fields';
import { maxLengthMessage } from '@/utils/validation';
import { PAYABLE_LIMITS } from './constants';

// Mirrors StoreAccountPayableRequest / UpdateAccountPayableRequest.
export const payableFormSchema = z
    .object({
        supplier_id: z.string().min(1, MESSAGES.chooseOption),
        item: z
            .string()
            .trim()
            .min(1, MESSAGES.required)
            .max(
                PAYABLE_LIMITS.itemLength,
                maxLengthMessage(PAYABLE_LIMITS.itemLength),
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
        status: z.enum(['pending', 'paid'], { error: MESSAGES.chooseOption }),
        description: z
            .string()
            .trim()
            .max(
                PAYABLE_LIMITS.descriptionLength,
                maxLengthMessage(PAYABLE_LIMITS.descriptionLength),
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
