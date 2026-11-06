import { z } from 'zod';
import { VALIDATION_MESSAGES as MESSAGES } from '@/constants/validation-messages';
import { maxLengthMessage } from '@/utils/validation';
import { BRAND_LIMITS } from './constants';

export const brandFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, MESSAGES.required)
        .max(
            BRAND_LIMITS.nameLength,
            maxLengthMessage(BRAND_LIMITS.nameLength),
        ),
    status: z.enum(['active', 'inactive'], { message: MESSAGES.chooseOption }),
});
