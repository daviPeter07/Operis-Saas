import { z } from 'zod';
import { maxLengthMessage } from '@/utils/validation';
import { PURCHASE_LIMITS } from './constants';

export const notesSchema = z
    .string()
    .max(
        PURCHASE_LIMITS.notesLength,
        maxLengthMessage(PURCHASE_LIMITS.notesLength),
    );
