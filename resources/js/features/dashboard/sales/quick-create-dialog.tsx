import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, Plus } from 'lucide-react';
import * as React from 'react';
import { SearchableSelect } from '@/components/searchable-select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type {
    QuickCreateField,
    QuickCreateFieldOption,
} from '@/types/quick-create';
import { applyFieldMask, parseMaskedFieldValue } from '@/utils/form-fields';

interface QuickCreateDialogProps<TResult> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    fields: QuickCreateField[];
    initialValues?: Record<string, string>;
    submitLabel?: string;
    keepOpenAfterSubmit?: boolean;
    onSubmit: (data: Record<string, string>) => TResult | Promise<TResult>;
    onCreated?: (result: TResult) => void;
}

function todayString(): string {
    return new Date().toISOString().slice(0, 10);
}

function defaultValuesForFields(
    fields: QuickCreateField[],
    initialValues: Record<string, string> = {},
): Record<string, string> {
    return fields.reduce<Record<string, string>>((values, field) => {
        if (initialValues[field.name]) {
            values[field.name] = initialValues[field.name];

            return values;
        }

        if (field.type === 'date') {
            values[field.name] = todayString();

            return values;
        }

        values[field.name] = '';

        return values;
    }, {});
}

function InlineDateField({
    field,
    value,
    onChange,
}: {
    field: QuickCreateField;
    value: string;
    onChange: (value: string) => void;
}) {
    const [openCalendar, setOpenCalendar] = React.useState(false);
    const selectedDate = value ? new Date(value) : undefined;

    return (
        <div className="space-y-2">
            <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setOpenCalendar((current) => !current)}
            >
                <CalendarDays className="h-4 w-4" />
                <span>
                    {value
                        ? format(selectedDate ?? new Date(), 'dd/MM/yyyy', {
                              locale: ptBR,
                          })
                        : field.placeholder || 'Selecione uma data'}
                </span>
            </Button>

            {openCalendar && (
                <div className="rounded-2xl border bg-background p-3 shadow-sm">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            if (date) {
                                onChange(date.toISOString().slice(0, 10));
                            }

                            setOpenCalendar(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
}

function renderSelectOptions(options: QuickCreateFieldOption[]) {
    return options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
            {option.label}
        </SelectItem>
    ));
}

export function QuickCreateDialog<TResult>({
    open,
    onOpenChange,
    title,
    description,
    fields,
    initialValues,
    submitLabel = 'Salvar',
    keepOpenAfterSubmit = true,
    onSubmit,
    onCreated,
}: QuickCreateDialogProps<TResult>) {
    const [formData, setFormData] = React.useState<Record<string, string>>(() =>
        defaultValuesForFields(fields, initialValues),
    );
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (open) {
            queueMicrotask(() =>
                setFormData(defaultValuesForFields(fields, initialValues)),
            );
        }
    }, [fields, initialValues, open]);

    const handleChange = (name: string, value: string) => {
        const field = fields.find((item) => item.name === name);

        setFormData((current) => ({
            ...current,
            [name]: applyFieldMask(value, field?.mask),
        }));
    };

    const isValid = fields.every((field) => {
        if (!field.required) {
            return true;
        }

        return Boolean(formData[field.name]?.trim());
    });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!isValid) {
            return;
        }

        setIsSubmitting(true);

        try {
            const submitData = fields.reduce<Record<string, string>>(
                (values, field) => ({
                    ...values,
                    [field.name]: String(
                        parseMaskedFieldValue(
                            formData[field.name] || '',
                            field.mask,
                        ),
                    ),
                }),
                { ...formData },
            );
            const result = await onSubmit(submitData);
            onCreated?.(result);

            if (keepOpenAfterSubmit) {
                setFormData(defaultValuesForFields(fields, initialValues));
            } else {
                onOpenChange(false);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-240">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        {fields.map((field) => (
                            <div
                                key={field.name}
                                className={cn(
                                    'grid gap-2',
                                    field.type === 'date' && 'md:col-span-2',
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

                                {field.type === 'select' && field.searchable ? (
                                    <SearchableSelect
                                        value={formData[field.name] || ''}
                                        onChange={(value) =>
                                            handleChange(field.name, value)
                                        }
                                        options={field.options || []}
                                        placeholder={
                                            field.placeholder ||
                                            `Digite ou selecione ${field.label.toLowerCase()}`
                                        }
                                        allowCustomValue={
                                            field.allowCustomValue
                                        }
                                    />
                                ) : field.type === 'select' ? (
                                    <Select
                                        value={formData[field.name] || ''}
                                        onValueChange={(value) =>
                                            handleChange(field.name, value)
                                        }
                                    >
                                        <SelectTrigger className="w-full justify-between">
                                            <SelectValue
                                                placeholder={
                                                    field.placeholder ||
                                                    `Selecione ${field.label.toLowerCase()}`
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {renderSelectOptions(
                                                field.options || [],
                                            )}
                                        </SelectContent>
                                    </Select>
                                ) : field.type === 'date' ? (
                                    <InlineDateField
                                        field={field}
                                        value={formData[field.name] || ''}
                                        onChange={(value) =>
                                            handleChange(field.name, value)
                                        }
                                    />
                                ) : field.name === 'notes' ? (
                                    <Textarea
                                        id={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={(event) =>
                                            handleChange(
                                                field.name,
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder={field.placeholder}
                                        rows={4}
                                    />
                                ) : (
                                    <Input
                                        id={field.name}
                                        type={
                                            field.mask === 'currency'
                                                ? 'text'
                                                : field.type
                                        }
                                        inputMode={
                                            field.mask === 'currency'
                                                ? 'numeric'
                                                : undefined
                                        }
                                        value={formData[field.name] || ''}
                                        onChange={(event) =>
                                            handleChange(
                                                field.name,
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder={field.placeholder}
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
                            Fechar
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isValid || isSubmitting}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            {isSubmitting ? 'Salvando...' : submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
