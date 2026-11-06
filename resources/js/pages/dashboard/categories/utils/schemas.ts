import { z } from 'zod';
import { VALIDATION_MESSAGES as MESSAGES } from '@/constants/validation-messages';
import { maxLengthMessage } from '@/utils/validation';
import { CATEGORY_LIMITS } from './constants';

export const categoryFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, MESSAGES.required)
        .max(
            CATEGORY_LIMITS.nameLength,
            maxLengthMessage(CATEGORY_LIMITS.nameLength),
        ),
    status: z.enum(['active', 'inactive'], { message: MESSAGES.chooseOption }),
});
