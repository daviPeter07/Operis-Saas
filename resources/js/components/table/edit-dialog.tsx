import * as React from 'react';
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

export interface EditField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'password' | 'select';
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
}

export interface EditDialogProps<T extends Record<string, unknown>> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    fields: EditField[];
    initialData: T;
    onSubmit: (data: T) => void;
    submitLabel?: string;
    className?: string;
}

export function EditDialog<T extends Record<string, unknown>>({
    open,
    onOpenChange,
    title = 'Editar Registro',
    description = 'Faça as alterações necessárias e salve.',
    fields,
    initialData,
    onSubmit,
    submitLabel = 'Salvar',
    className,
}: EditDialogProps<T>) {
    const [formData, setFormData] = React.useState<Partial<T>>(initialData);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

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
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData(initialData);
        }
    }, [open, initialData]);

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await onSubmit(formData as T);
            onOpenChange(false);
        } catch {
            throw new Error('edit_failed');
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
                        {fields.map((field) => (
                            <div
                                key={field.name}
                                className={cn(
                                    'grid gap-2',
                                    getFieldSpanClass(field.name),
                                )}
                            >
                                <Label htmlFor={`edit-${field.name}`}>
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
                                        <Input
                                            id={`edit-${field.name}`}
                                            list={`edit-${field.name}-options`}
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
                                        {field.options &&
                                        field.options.length > 0 ? (
                                            <datalist
                                                id={`edit-${field.name}-options`}
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
                                    <Input
                                        id={`edit-${field.name}`}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={
                                            (formData[field.name] as string) ||
                                            ''
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                field.name,
                                                e.target.value,
                                            )
                                        }
                                        required={field.required}
                                    />
                                )}
                            </div>
                        ))}
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
                            {isSubmitting ? 'Salvando...' : submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
