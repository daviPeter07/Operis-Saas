import { z } from 'zod';
import { VALIDATION_MESSAGES as MESSAGES } from '@/constants/validation-messages';
import { parseCurrencyInput } from '@/utils/form-fields';
import { maxLengthMessage } from '@/utils/validation';
import { SERVICE_LIMITS } from './constants';

const withinLimit = (value: string) =>
    parseCurrencyInput(value) <= SERVICE_LIMITS.maxAmount;

// Mirrors Store/UpdateServiceRequest.
export const serviceFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, MESSAGES.required)
        .max(
            SERVICE_LIMITS.nameLength,
            maxLengthMessage(SERVICE_LIMITS.nameLength),
        ),
    description: z
        .string()
        .trim()
        .max(
            SERVICE_LIMITS.descriptionLength,
            maxLengthMessage(SERVICE_LIMITS.descriptionLength),
        ),
    price: z
        .string()
        .trim()
        .min(1, MESSAGES.required)
        .refine(withinLimit, MESSAGES.tooHigh),
    cost: z.string().trim().refine(withinLimit, MESSAGES.tooHigh),
    status: z.enum(['active', 'inactive'], { message: MESSAGES.chooseOption }),
});
