import { z } from 'zod';
import { VALIDATION_MESSAGES as MESSAGES } from '@/constants/validation-messages';
import { maxLengthMessage } from '@/utils/validation';
import { SUPPLIER_LIMITS } from './constants';

function optionalText(max: number) {
    return z.string().trim().max(max, maxLengthMessage(max));
}

export const supplierFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, MESSAGES.required)
        .max(
            SUPPLIER_LIMITS.nameLength,
            maxLengthMessage(SUPPLIER_LIMITS.nameLength),
        ),
    person_type: z.enum(['pf', 'pj'], { error: MESSAGES.chooseOption }),
    email: optionalText(SUPPLIER_LIMITS.emailLength).refine(
        (value) => value === '' || z.email().safeParse(value).success,
        MESSAGES.invalidEmail,
    ),
    phone: optionalText(SUPPLIER_LIMITS.phoneLength),
    document: optionalText(SUPPLIER_LIMITS.documentLength),
});
