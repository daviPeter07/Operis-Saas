import type { FieldMask } from '@/utils/form-fields';

export type QuickCreateFieldType = 'text' | 'number' | 'select' | 'date';

export type QuickCreateFieldOption = {
    value: string;
    label: string;
};

export type QuickCreateField = {
    name: string;
    label: string;
    type: QuickCreateFieldType;
    placeholder?: string;
    required?: boolean;
    options?: QuickCreateFieldOption[];
    searchable?: boolean;
    allowCustomValue?: boolean;
    mask?: FieldMask;
};
