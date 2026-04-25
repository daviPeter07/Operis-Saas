import * as React from 'react';
import { Barcode, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
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
import { cn } from '@/lib/utils';

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'password' | 'select' | 'date';
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
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

function generateInternalCode(name: string, brand: string): string {
    const nameToken = buildCodeToken(name, 2) || 'ITEM';
    const brandToken = buildCodeToken(brand, 1);
    const randomToken = String(Math.floor(1000 + Math.random() * 9000));

    return [nameToken, brandToken, randomToken].filter(Boolean).join('-');
}

function calculateEan13Checksum(code12: string): number {
    let sum = 0;

    for (let index = 0; index < code12.length; index += 1) {
        const value = Number(code12[index]);
        sum += index % 2 === 0 ? value : value * 3;
    }

    return (10 - (sum % 10)) % 10;
}

function generateEan13Code(): string {
    const body = Array.from({ length: 12 }, () =>
        String(Math.floor(Math.random() * 10)),
    ).join('');
    const checksum = calculateEan13Checksum(body);

    return `${body}${checksum}`;
}

function isBarcodeField(fieldName: string, fieldLabel: string): boolean {
    const target = `${fieldName} ${fieldLabel}`.toLowerCase();

    return (
        target.includes('barcode') ||
        target.includes('bar code') ||
        target.includes('codigo de barras') ||
        target.includes('código de barras') ||
        target.includes('ean')
    );
}

function isCodeField(fieldName: string, fieldLabel: string): boolean {
    const target = `${fieldName} ${fieldLabel}`.toLowerCase();

    return (
        target.includes('sku') ||
        target.includes('codigo') ||
        target.includes('código') ||
        target.includes('code')
    );
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
            return 'sm:max-w-[920px]';
        }

        if (fields.length >= 4) {
            return 'sm:max-w-[760px]';
        }

        return 'sm:max-w-[500px]';
    }, [fields.length]);

    const getFieldSpanClass = (fieldName: string) => {
        const normalized = fieldName.toLowerCase();
        const isLongField = ['description', 'address', 'notes', 'obs'].some(
            (keyword) => normalized.includes(keyword),
        );

        if (!isLongField) {
            return '';
        }

        if (fields.length >= 9) {
            return 'sm:col-span-2 lg:col-span-3';
        }

        return 'sm:col-span-2';
    };

    React.useEffect(() => {
        if (open) {
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

            setFormData(defaults as Partial<T>);
        }
    }, [fields, open]);

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleGenerateInternalCode = (fieldName: string) => {
        const nameSeed = String(
            (formData as Record<string, unknown>).name ||
                (formData as Record<string, unknown>).productName ||
                '',
        );
        const brandSeed = String(
            (formData as Record<string, unknown>).brand || '',
        );

        handleChange(fieldName, generateInternalCode(nameSeed, brandSeed));
    };

    const handleGenerateBarcode = (fieldName: string) => {
        handleChange(fieldName, generateEan13Code());
    };

    const handleFocusScannerField = (fieldName: string) => {
        inputRefs.current[fieldName]?.focus();
        toast.info('Campo pronto para leitura por scanner');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await onSubmit(formData as T);
            toast.success('Registro criado com sucesso');
            onOpenChange(false);
        } catch (error) {
            toast.error('Erro ao criar registro');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValid = fields.every((field) => {
        if (field.required) {
            return (
                formData[field.name] !== undefined &&
                formData[field.name] !== ''
            );
        }

        return true;
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(dialogWidthClass, className)}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className={cn('grid gap-4 py-4', gridColumnsClass)}>
                        {fields.map((field) => {
                            const barcodeField = isBarcodeField(
                                field.name,
                                field.label,
                            );
                            const codeField =
                                !barcodeField &&
                                isCodeField(field.name, field.label);

                            return (
                                <div
                                    key={field.name}
                                    className={cn(
                                        'grid gap-2',
                                        getFieldSpanClass(field.name),
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
                                    {field.type === 'select' ? (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id={field.name}
                                                    ref={(node) => {
                                                        inputRefs.current[
                                                            field.name
                                                        ] = node;
                                                    }}
                                                    list={`${field.name}-options`}
                                                    type="text"
                                                    placeholder={
                                                        field.placeholder ||
                                                        `Digite ou selecione ${field.label.toLowerCase()}`
                                                    }
                                                    value={
                                                        (formData[
                                                            field.name
                                                        ] as string) || ''
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            field.name,
                                                            e.target.value,
                                                        )
                                                    }
                                                    required={field.required}
                                                />
                                                {codeField ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="shrink-0"
                                                        onClick={() =>
                                                            handleGenerateInternalCode(
                                                                field.name,
                                                            )
                                                        }
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
                                                            onClick={() =>
                                                                handleGenerateBarcode(
                                                                    field.name,
                                                                )
                                                            }
                                                        >
                                                            <Sparkles className="mr-1 h-3.5 w-3.5" />
                                                            Gerar
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="shrink-0"
                                                            onClick={() =>
                                                                handleFocusScannerField(
                                                                    field.name,
                                                                )
                                                            }
                                                        >
                                                            <Barcode className="mr-1 h-3.5 w-3.5" />
                                                            Ler
                                                        </Button>
                                                    </>
                                                ) : null}
                                            </div>
                                            {field.options &&
                                            field.options.length > 0 ? (
                                                <datalist
                                                    id={`${field.name}-options`}
                                                >
                                                    {field.options.map((opt) => (
                                                        <option
                                                            key={opt.value}
                                                            value={opt.value}
                                                        >
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </datalist>
                                            ) : null}
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id={field.name}
                                                ref={(node) => {
                                                    inputRefs.current[
                                                        field.name
                                                    ] = node;
                                                }}
                                                type={field.type}
                                                placeholder={field.placeholder}
                                                value={
                                                    (formData[
                                                        field.name
                                                    ] as string) || ''
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        field.name,
                                                        e.target.value,
                                                    )
                                                }
                                                required={field.required}
                                            />
                                            {codeField ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="shrink-0"
                                                    onClick={() =>
                                                        handleGenerateInternalCode(
                                                            field.name,
                                                        )
                                                    }
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
                                                        onClick={() =>
                                                            handleGenerateBarcode(
                                                                field.name,
                                                            )
                                                        }
                                                    >
                                                        <Sparkles className="mr-1 h-3.5 w-3.5" />
                                                        Gerar
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="shrink-0"
                                                        onClick={() =>
                                                            handleFocusScannerField(
                                                                field.name,
                                                            )
                                                        }
                                                    >
                                                        <Barcode className="mr-1 h-3.5 w-3.5" />
                                                        Ler
                                                    </Button>
                                                </>
                                            ) : null}
                                        </div>
                                    )}
                                    {barcodeField ? (
                                        <p className="text-xs text-muted-foreground">
                                            Suporta leitura por scanner USB com
                                            foco neste campo.
                                        </p>
                                    ) : null}
                                </div>
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
