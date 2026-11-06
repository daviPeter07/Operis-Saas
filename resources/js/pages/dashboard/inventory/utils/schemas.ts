import { z } from 'zod';
import { VALIDATION_MESSAGES as MESSAGES } from '@/constants/validation-messages';
import { parseCurrencyInput } from '@/utils/form-fields';
import { maxLengthMessage } from '@/utils/validation';
import { PRODUCT_LIMITS } from './constants';

const productName = z
    .string()
    .trim()
    .min(1, MESSAGES.required)
    .max(
        PRODUCT_LIMITS.nameLength,
        maxLengthMessage(PRODUCT_LIMITS.nameLength),
    );

const productSku = z
    .string()
    .trim()
    .min(1, MESSAGES.required)
    .max(PRODUCT_LIMITS.skuLength, maxLengthMessage(PRODUCT_LIMITS.skuLength));

const quickCreateName = z
    .string()
    .trim()
    .min(1, MESSAGES.required)
    .max(
        PRODUCT_LIMITS.quickCreateNameLength,
        maxLengthMessage(PRODUCT_LIMITS.quickCreateNameLength),
    );

const optionId = z
    .string()
    .min(1, MESSAGES.required)
    .regex(/^\d+$/, MESSAGES.chooseOption);

const moneyAmount = z
    .string()
    .trim()
    .min(1, MESSAGES.required)
    .refine(
        (value) => parseCurrencyInput(value) <= PRODUCT_LIMITS.maxAmount,
        MESSAGES.tooHigh,
    );

const quantity = z
    .string()
    .trim()
    .min(1, MESSAGES.required)
    .refine((value) => Number.isFinite(Number(value)), MESSAGES.invalidNumber)
    .refine((value) => Number(value) >= 0, MESSAGES.notNegative)
    .refine((value) => /^-?\d+(\.\d{1,2})?$/.test(value), MESSAGES.maxDecimals)
    .refine(
        (value) => Number(value) <= PRODUCT_LIMITS.maxAmount,
        MESSAGES.tooHigh,
    );

export const productFormSchema = z.object({
    id: z.number().optional(),
    name: productName,
    sku: productSku,
    barcode: z
        .string()
        .trim()
        .max(
            PRODUCT_LIMITS.barcodeLength,
            maxLengthMessage(PRODUCT_LIMITS.barcodeLength),
        )
        .regex(/^\S*$/, MESSAGES.noSpaces),
    cost: moneyAmount,
    sale_price: moneyAmount,
    stock: quantity,
    min_stock: quantity,
    category_id: optionId,
    brand_id: optionId,
    description: z
        .string()
        .max(
            PRODUCT_LIMITS.descriptionLength,
            maxLengthMessage(PRODUCT_LIMITS.descriptionLength),
        ),
});

export const quickCreateSchema = z.object({
    name: quickCreateName,
});
