export type FieldOption = {
    value: string;
    label: string;
};

export type FieldMask = 'currency' | 'phone' | 'document';

export function onlyDigits(value: string): string {
    return value.replace(/\D/g, '');
}

export function formatCurrencyInput(value: string): string {
    const digits = onlyDigits(value);

    if (!digits) {
        return '';
    }

    const amount = Number(digits) / 100;

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount);
}

export function parseCurrencyInput(value: string): number {
    const digits = onlyDigits(value);

    if (!digits) {
        return 0;
    }

    return Number((Number(digits) / 100).toFixed(2));
}

export function formatPhoneInput(value: string): string {
    const digits = onlyDigits(value).slice(0, 11);

    if (digits.length <= 2) {
        return digits;
    }

    if (digits.length <= 6) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatDocumentInput(value: string): string {
    const digits = onlyDigits(value).slice(0, 14);

    if (digits.length <= 11) {
        return digits
            .replace(/^(\d{3})(\d)/, '$1.$2')
            .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1-$2');
    }

    return digits
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
}

export function applyFieldMask(value: string, mask?: FieldMask): string {
    if (mask === 'currency') {
        return formatCurrencyInput(value);
    }

    if (mask === 'phone') {
        return formatPhoneInput(value);
    }

    if (mask === 'document') {
        return formatDocumentInput(value);
    }

    return value;
}

export function parseMaskedFieldValue(value: string, mask?: FieldMask) {
    if (mask === 'currency') {
        return parseCurrencyInput(value);
    }

    return value;
}

function normalizeCodeSeed(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .trim();
}

function buildCodeToken(value: string, maxWords: number): string {
    const normalized = normalizeCodeSeed(value);

    if (normalized.length === 0) {
        return '';
    }

    return normalized
        .split(/\s+/)
        .slice(0, maxWords)
        .map((word) => word.slice(0, 3).toUpperCase())
        .join('');
}

export function generateInternalCode(name: string, brand: string): string {
    const nameToken = buildCodeToken(name, 2) || 'ITEM';
    const brandToken = buildCodeToken(brand, 1);
    const randomToken = String(Math.floor(1000 + Math.random() * 9000));

    return [nameToken, brandToken, randomToken].filter(Boolean).join('-');
}

export function calculateEan13Checksum(code12: string): number {
    let sum = 0;

    for (let index = 0; index < code12.length; index += 1) {
        const value = Number(code12[index]);
        sum += index % 2 === 0 ? value : value * 3;
    }

    return (10 - (sum % 10)) % 10;
}

export function generateEan13Code(): string {
    const body = Array.from({ length: 12 }, () =>
        String(Math.floor(Math.random() * 10)),
    ).join('');
    const checksum = calculateEan13Checksum(body);

    return `${body}${checksum}`;
}

export function isBarcodeField(fieldName: string, fieldLabel: string): boolean {
    const target = `${fieldName} ${fieldLabel}`.toLowerCase();

    return (
        target.includes('barcode') ||
        target.includes('bar code') ||
        target.includes('codigo de barras') ||
        target.includes('código de barras') ||
        target.includes('ean')
    );
}

export function isCodeField(fieldName: string, fieldLabel: string): boolean {
    const target = `${fieldName} ${fieldLabel}`.toLowerCase();

    return (
        target.includes('sku') ||
        target.includes('codigo') ||
        target.includes('código') ||
        target.includes('code')
    );
}
