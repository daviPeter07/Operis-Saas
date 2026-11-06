import { z } from 'zod';
import { VALIDATION_MESSAGES as MESSAGES } from '@/constants/validation-messages';
import { parseCurrencyInput } from '@/utils/form-fields';
import { maxLengthMessage } from '@/utils/validation';
import { CLIENT_LIMITS, CREDIT_LIMIT_TOO_HIGH } from './constants';

function maxText(max: number) {
    return z.string().trim().max(max, maxLengthMessage(max));
}

export const clientFormSchema = z
    .object({
        name: maxText(CLIENT_LIMITS.nameLength).min(1, MESSAGES.required),
        person_type: z.enum(['pf', 'pj']),
        email: maxText(CLIENT_LIMITS.emailLength).refine(
            (value) => value === '' || z.email().safeParse(value).success,
            MESSAGES.invalidEmail,
        ),
        phone: maxText(CLIENT_LIMITS.phoneLength),
        document: maxText(CLIENT_LIMITS.documentLength),
        status: z.enum(['active', 'inactive']),
        credit_enabled: z.enum(['yes', 'no']),
        credit_limit: z.string(),
        credit_term_days: z
            .string()
            .regex(/^\d+$/, MESSAGES.invalidNumber)
            .refine(
                (value) =>
                    Number(value) >= CLIENT_LIMITS.minTermDays &&
                    Number(value) <= CLIENT_LIMITS.maxTermDays,
                MESSAGES.tooHigh,
            ),
    })
    // The limit only counts (and is only editable) with the store credit enabled.
    .refine(
        (values) =>
            values.credit_enabled === 'no' ||
            parseCurrencyInput(values.credit_limit) <=
                CLIENT_LIMITS.maxCreditLimit,
        { path: ['credit_limit'], message: CREDIT_LIMIT_TOO_HIGH },
    );
