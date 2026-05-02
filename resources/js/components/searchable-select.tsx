import { X } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { FieldOption } from '@/utils/form-fields';

type SearchableSelectProps = {
    value: string;
    onChange: (value: string) => void;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    options: FieldOption[];
    placeholder?: string;
    emptyMessage?: string;
    allowCustomValue?: boolean;
    className?: string;
    inputClassName?: string;
    disabled?: boolean;
};

export function SearchableSelect({
    value,
    onChange,
    searchValue,
    onSearchChange,
    options,
    placeholder = 'Buscar...',
    emptyMessage = 'Nenhum resultado encontrado.',
    allowCustomValue = false,
    className,
    inputClassName,
    disabled = false,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const selectedOption = options.find((option) => option.value === value);
    const displayValue = searchValue ?? selectedOption?.label ?? value;
    const normalizedValue = displayValue.trim().toLowerCase();
    const filteredOptions = React.useMemo(() => {
        if (!normalizedValue) {
            return options;
        }

        return options.filter((option) => {
            return (
                option.label.toLowerCase().includes(normalizedValue) ||
                option.value.toLowerCase().includes(normalizedValue)
            );
        });
    }, [normalizedValue, options]);

    React.useEffect(() => {
        const handleMouseDown = (event: MouseEvent) => {
            if (!containerRef.current) {
                return;
            }

            if (!containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <div className="relative">
                <Input
                    value={displayValue}
                    onChange={(event) => {
                        const nextValue = event.currentTarget.value;

                        if (onSearchChange) {
                            onSearchChange(nextValue);
                        } else {
                            onChange(nextValue);
                        }

                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onClick={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className={cn('pr-10', inputClassName)}
                    readOnly={!allowCustomValue && !onSearchChange}
                    disabled={disabled}
                />
                {value ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            onChange('');
                            onSearchChange?.('');
                            setIsOpen(false);
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                ) : null}
            </div>

            {isOpen && !disabled ? (
                <div className="absolute top-full z-50 mt-2 max-h-44 w-full overflow-y-auto rounded-md border bg-background shadow-sm">
                    {filteredOptions.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">
                            {allowCustomValue && displayValue.trim()
                                ? `Usar "${displayValue.trim()}"`
                                : emptyMessage}
                        </p>
                    ) : (
                        filteredOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className="w-full border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted"
                            >
                                {option.label}
                            </button>
                        ))
                    )}
                </div>
            ) : null}
        </div>
    );
}
