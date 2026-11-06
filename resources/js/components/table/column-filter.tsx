import { Search, X } from 'lucide-react';
import * as React from 'react';
import { InputSearchComplete } from '@/components/input-search-complete';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { FieldOption } from '@/utils/form-fields';

export type ColumnFilterConfig =
    | { type: 'text'; key: string; placeholder?: string }
    | {
          type: 'search-select';
          key: string;
          options: FieldOption[];
          placeholder?: string;
      }
    | {
          type: 'select';
          key: string;
          options: FieldOption[];
          allLabel?: string;
      };

type ColumnFilterProps = {
    config: ColumnFilterConfig;
    value: string;
    onChange: (value: string) => void;
    label: string;
    variant?: 'underline' | 'boxed';
    className?: string;
};

const ALL = 'all';

const underlineField =
    'h-8 rounded-none border-0 border-b border-input bg-transparent pl-0 font-normal shadow-none focus-visible:border-accent focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent';

export function ColumnFilter({
    config,
    value,
    onChange,
    label,
    variant = 'boxed',
    className,
}: ColumnFilterProps) {
    const isUnderline = variant === 'underline';

    if (config.type === 'text') {
        return (
            <TextFilter
                value={value}
                onChange={onChange}
                label={label}
                placeholder={config.placeholder ?? `Filtrar por ${label}`}
                isUnderline={isUnderline}
                className={className}
            />
        );
    }

    if (config.type === 'search-select') {
        return (
            <InputSearchComplete
                value={value}
                onChange={onChange}
                options={config.options}
                ariaLabel={`Filtrar ${label}`}
                placeholder={config.placeholder ?? `Filtrar por ${label}`}
                emptyMessage="Nada encontrado."
                className={cn('min-w-36', className)}
                inputClassName={isUnderline ? underlineField : undefined}
            />
        );
    }

    return (
        <Select
            value={value === '' ? ALL : value}
            onValueChange={(next) => onChange(next === ALL ? '' : next)}
        >
            <SelectTrigger
                aria-label={`Filtrar ${label}`}
                className={cn(
                    'h-9 min-w-28 font-normal',
                    isUnderline &&
                        cn(
                            underlineField,
                            'w-full pr-0 data-[size=default]:h-8',
                        ),
                    className,
                )}
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={ALL}>
                    {config.allLabel ?? 'Todos'}
                </SelectItem>
                {config.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function TextFilter({
    value,
    onChange,
    label,
    placeholder,
    isUnderline,
    className,
}: {
    value: string;
    onChange: (value: string) => void;
    label: string;
    placeholder: string;
    isUnderline: boolean;
    className?: string;
}) {
    const [draft, setDraft] = React.useState(value);

    React.useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraft(value);
    }, [value]);

    React.useEffect(() => {
        if (draft === value) {
            return;
        }

        const timeout = window.setTimeout(() => onChange(draft.trim()), 400);

        return () => window.clearTimeout(timeout);
    }, [draft, onChange, value]);

    return (
        <div className={cn('relative min-w-32', className)}>
            {isUnderline ? null : (
                <Search
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                />
            )}
            <Input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.currentTarget.value)}
                aria-label={`Filtrar ${label}`}
                placeholder={placeholder}
                title={placeholder}
                className={cn(
                    'pr-7 font-normal',
                    isUnderline ? underlineField : 'h-9 pl-8',
                )}
            />
            {draft ? (
                <button
                    type="button"
                    aria-label={`Limpar filtro de ${label}`}
                    onClick={() => {
                        setDraft('');
                        onChange('');
                    }}
                    className={cn(
                        'absolute top-1/2 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-muted-foreground hover:text-foreground',
                        isUnderline ? 'right-0' : 'right-1.5',
                    )}
                >
                    <X className="size-3.5" />
                </button>
            ) : null}
        </div>
    );
}
