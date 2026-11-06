import { VALIDATION_MESSAGES } from '@/constants/validation-messages';

export function maxLengthMessage(max: number): string {
    return VALIDATION_MESSAGES.maxLength.replace(
        ':max',
        max.toLocaleString('pt-BR'),
    );
}
