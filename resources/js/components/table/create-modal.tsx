import { X } from 'lucide-react';
import * as React from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'password' | 'select';
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
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

    React.useEffect(() => {
        if (open) {
            setFormData({});
        }
    }, [open]);

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
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
            <DialogContent className={cn('sm:max-w-[500px]', className)}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 py-4">
                        {fields.map((field) => (
                            <div key={field.name} className="grid gap-2">
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
                                    <Select
                                        value={
                                            (formData[field.name] as string) ||
                                            ''
                                        }
                                        onValueChange={(value) =>
                                            handleChange(field.name, value)
                                        }
                                    >
                                        <SelectTrigger id={field.name}>
                                            <SelectValue
                                                placeholder={
                                                    field.placeholder ||
                                                    `Selecione ${field.label}`
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {field.options?.map((opt) => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        id={field.name}
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
                            {isSubmitting ? 'Criando...' : submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
