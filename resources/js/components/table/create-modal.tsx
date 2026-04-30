import { Barcode, Sparkles } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { SearchableSelect } from '@/components/searchable-select';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
    applyFieldMask,
    generateEan13Code,
    generateInternalCode,
    isBarcodeField,
    isCodeField,
    parseMaskedFieldValue,
} from '@/utils/form-fields';
import type { FieldMask, FieldOption } from '@/utils/form-fields';

export interface FormField {
    name: string;
    label: string;
    type:
        | 'text'
        | 'number'
        | 'email'
        | 'password'
        | 'select'
        | 'date'
        | 'textarea';
    placeholder?: string;
    required?: boolean;
    options?: FieldOption[];
    section?: string;
    span?: 'default' | 'wide' | 'full';
    searchable?: boolean;
    allowCustomValue?: boolean;
    mask?: FieldMask;
    actionButton?: {
        label: string;
        onClick: () => void;
    };
}

export interface CreateModalProps<T extends Record<string, unknown>> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    fields: FormField[];
    onSubmit: (data: T) => void;
    submitLabel?: string;
    className?: string;
}

export function CreateModal<T extends Record<string, unknown>>({
    open,
    onOpenChange,
    title = 'Criar Novo Registro',
    description = 'Preencha os dados abaixo para criar um novo registro.',
    fields,
    onSubmit,
    submitLabel = 'Criar',
    className,
}: CreateModalProps<T>) {
    const [formData, setFormData] = React.useState<Partial<T>>({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const inputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

    const gridColumnsClass = React.useMemo(() => {
        if (fields.length >= 9) {
            return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
        }

        if (fields.length >= 4) {
            return 'grid-cols-1 sm:grid-cols-2';
        }

        return 'grid-cols-1';
    }, [fields.length]);

    const dialogWidthClass = React.useMemo(() => {
        if (fields.length >= 9) {
            return '!w-[calc(100vw-2rem)] sm:!max-w-[1240px]';
        }

        if (fields.length >= 4) {
            return '!w-[calc(100vw-2rem)] sm:!max-w-[860px]';
        }

        return '!w-[calc(100vw-2rem)] sm:!max-w-[520px]';
    }, [fields.length]);

    const getFieldSpanClass = (field: FormField) => {
        if (field.span === 'full') {
            return fields.length >= 9
                ? 'sm:col-span-2 lg:col-span-3'
                : 'sm:col-span-2';
        }

        if (field.span === 'wide') {
            return 'sm:col-span-2';
        }

        const normalized = field.name.toLowerCase();
        const isLongField = ['description', 'address', 'notes', 'obs'].some(
            (keyword) => normalized.includes(keyword),
        );

        if (!isLongField) {
            return '';
        }

        return fields.length >= 9
            ? 'sm:col-span-2 lg:col-span-3'
            : 'sm:col-span-2';
    };

    const buildDefaultFormData = React.useCallback(() => {
        const today = new Date().toISOString().slice(0, 10);
        const defaults: Record<string, unknown> = {};

        fields.forEach((field) => {
            const key = field.name.toLowerCase();

            if (field.type === 'date') {
                defaults[field.name] = today;
            }

            if (
                key === 'status' &&
                field.options?.some((option) => option.value === 'pending')
            ) {
                defaults[field.name] = 'pending';
            }

            if (
                key === 'paymentmethod' &&
                field.options?.some((option) => option.value === 'pix')
            ) {
                defaults[field.name] = 'pix';
            }
        });

        return defaults as Partial<T>;
    }, [fields]);

    React.useEffect(() => {
        if (open) {
            queueMicrotask(() => setFormData(buildDefaultFormData()));
        }
    }, [buildDefaultFormData, open]);

    const handleChange = (field: FormField, value: string) => {
        setFormData((previous) => ({
            ...previous,
            [field.name]: applyFieldMask(value, field.mask),
        }));
    };

    const handleGenerateInternalCode = (fieldName: string) => {
        const values = formData as Record<string, unknown>;
        const nameSeed = String(values.name || values.productName || '');
        const brandSeed = String(values.brand || '');

        setFormData((previous) => ({
            ...previous,
            [fieldName]: generateInternalCode(nameSeed, brandSeed),
        }));
    };

    const handleGenerateBarcode = (fieldName: string) => {
        setFormData((previous) => ({
            ...previous,
            [fieldName]: generateEan13Code(),
        }));
    };

    const handleFocusScannerField = (fieldName: string) => {
        inputRefs.current[fieldName]?.focus();
        toast.info('Campo pronto para leitura por scanner');
    };

    const isValid = fields.every((field) => {
        if (!field.required) {
            return true;
        }

        return Boolean(String(formData[field.name] ?? '').trim());
    });

    const prepareSubmitData = () => {
        return fields.reduce<Record<string, unknown>>(
            (values, field) => ({
                ...values,
                [field.name]: parseMaskedFieldValue(
                    String(formData[field.name] ?? ''),
                    field.mask,
                ),
            }),
            { ...(formData as Record<string, unknown>) },
        ) as T;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            await onSubmit(prepareSubmitData());
            toast.success('Registro criado com sucesso');
            onOpenChange(false);
        } catch {
            toast.error('Erro ao criar registro');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderInputActions = (field: FormField) => {
        const barcodeField = isBarcodeField(field.name, field.label);
        const codeField = !barcodeField && isCodeField(field.name, field.label);

        return (
            <>
                {codeField ? (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => handleGenerateInternalCode(field.name)}
                    >
                        <Sparkles className="mr-1 h-3.5 w-3.5" />
                        Gerar
                    </Button>
                ) : null}
                {barcodeField ? (
                    <>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={() => handleGenerateBarcode(field.name)}
                        >
                            <Sparkles className="mr-1 h-3.5 w-3.5" />
                            Gerar
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={() => handleFocusScannerField(field.name)}
                        >
                            <Barcode className="mr-1 h-3.5 w-3.5" />
                            Ler
                        </Button>
                    </>
                ) : null}
            </>
        );
    };

    const renderFieldControl = (field: FormField) => {
        const value = String(formData[field.name] ?? '');
        const barcodeField = isBarcodeField(field.name, field.label);
        const codeField = !barcodeField && isCodeField(field.name, field.label);

        if (field.searchable) {
            return (
                <div className="flex min-w-0 items-center gap-2">
                    <SearchableSelect
                        value={value}
                        onChange={(nextValue) => handleChange(field, nextValue)}
                        options={field.options || []}
                        placeholder={
                            field.placeholder ||
                            `Digite ou selecione ${field.label.toLowerCase()}`
                        }
                        emptyMessage="Nenhum resultado encontrado."
                        allowCustomValue={field.allowCustomValue}
                        className="min-w-0 flex-1"
                    />
                    {field.actionButton ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={field.actionButton.onClick}
                        >
                            {field.actionButton.label}
                        </Button>
                    ) : null}
                </div>
            );
        }

        if (field.type === 'select') {
            return (
                <div className="flex min-w-0 items-center gap-2">
                    <Input
                        id={field.name}
                        ref={(node) => {
                            inputRefs.current[field.name] = node;
                        }}
                        list={`${field.name}-options`}
                        type="text"
                        placeholder={
                            field.placeholder ||
                            `Digite ou selecione ${field.label.toLowerCase()}`
                        }
                        value={value}
                        onChange={(event) =>
                            handleChange(field, event.target.value)
                        }
                        required={field.required}
                        className="min-w-0 flex-1"
                    />
                    {field.actionButton ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={field.actionButton.onClick}
                        >
                            {field.actionButton.label}
                        </Button>
                    ) : null}
                    {field.options && field.options.length > 0 ? (
                        <datalist id={`${field.name}-options`}>
                            {field.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </datalist>
                    ) : null}
                </div>
            );
        }

        if (field.type === 'textarea') {
            return (
                <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    value={value}
                    onChange={(event) =>
                        handleChange(field, event.target.value)
                    }
                    required={field.required}
                    className="min-h-24 resize-none"
                />
            );
        }

        if (barcodeField) {
            return (
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
                    <Input
                        id={field.name}
                        ref={(node) => {
                            inputRefs.current[field.name] = node;
                        }}
                        type={field.mask === 'currency' ? 'text' : field.type}
                        inputMode={
                            field.mask === 'currency' ? 'numeric' : undefined
                        }
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(event) =>
                            handleChange(field, event.target.value)
                        }
                        required={field.required}
                        className="min-w-0"
                    />
                    {renderInputActions(field)}
                </div>
            );
        }

        if (codeField) {
            return (
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <Input
                        id={field.name}
                        ref={(node) => {
                            inputRefs.current[field.name] = node;
                        }}
                        type={field.mask === 'currency' ? 'text' : field.type}
                        inputMode={
                            field.mask === 'currency' ? 'numeric' : undefined
                        }
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(event) =>
                            handleChange(field, event.target.value)
                        }
                        required={field.required}
                        className="min-w-0"
                    />
                    {renderInputActions(field)}
                </div>
            );
        }

        return (
            <div className="flex min-w-0 items-center gap-2">
                <Input
                    id={field.name}
                    ref={(node) => {
                        inputRefs.current[field.name] = node;
                    }}
                    type={field.mask === 'currency' ? 'text' : field.type}
                    inputMode={
                        field.mask === 'currency' ? 'numeric' : undefined
                    }
                    placeholder={field.placeholder}
                    value={value}
                    onChange={(event) =>
                        handleChange(field, event.target.value)
                    }
                    required={field.required}
                    className="min-w-0 flex-1"
                />
                {renderInputActions(field)}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(dialogWidthClass, className)}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className={cn('grid gap-4 py-4', gridColumnsClass)}>
                        {fields.map((field, index) => {
                            const showSection =
                                field.section &&
                                field.section !== fields[index - 1]?.section;

                            return (
                                <React.Fragment key={field.name}>
                                    {showSection ? (
                                        <div className="sm:col-span-2 lg:col-span-3">
                                            <h3 className="text-sm font-semibold text-foreground">
                                                {field.section}
                                            </h3>
                                        </div>
                                    ) : null}

                                    <div
                                        className={cn(
                                            'grid gap-2',
                                            getFieldSpanClass(field),
                                        )}
                                    >
                                        <Label htmlFor={field.name}>
                                            {field.label}
                                            {field.required && (
                                                <span className="text-destructive">
                                                    {' '}
                                                    *
                                                </span>
                                            )}
                                        </Label>
                                        {renderFieldControl(field)}
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isValid || isSubmitting}
                        >
                            {isSubmitting ? 'Criando...' : submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
