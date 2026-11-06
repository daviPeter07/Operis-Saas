import { Check, ChevronDown, Plus, X } from 'lucide-react';
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { FieldOption } from '@/utils/form-fields';

type InputSearchCompleteProps = {
    value: string;
    onChange: (value: string) => void;
    options: FieldOption[];
    id?: string;
    ariaLabel?: string;
    placeholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    invalid?: boolean;
    className?: string;
    inputClassName?: string;
    onCreateOption?: (query: string) => void;
    createOptionLabel?: (query: string) => string;
};

// Esc closes the open list instead of the whole Radix dialog.
export function keepDialogOpenWhileSearchListOpen(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;

    if (
        target?.getAttribute('role') === 'combobox' &&
        target.getAttribute('aria-expanded') === 'true'
    ) {
        event.preventDefault();
    }
}

function normalize(text: string): string {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function InputSearchComplete({
    value,
    onChange,
    options,
    id,
    ariaLabel,
    placeholder = 'Digite para buscar',
    emptyMessage = 'Nenhum resultado encontrado.',
    disabled = false,
    invalid = false,
    className,
    inputClassName,
    onCreateOption,
    createOptionLabel = (query) => `Criar "${query}"`,
}: InputSearchCompleteProps) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const listboxId = `${inputId}-options`;
    const containerRef = React.useRef<HTMLDivElement>(null);
    const listRef = React.useRef<HTMLUListElement>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [query, setQuery] = React.useState<string | null>(null);
    const [activeIndex, setActiveIndex] = React.useState(0);

    const selectedOption = options.find((option) => option.value === value);
    const isSearching = query !== null;
    const normalizedQuery = isSearching ? normalize(query) : '';

    const filteredOptions = React.useMemo(
        () =>
            normalizedQuery
                ? options.filter((option) =>
                      normalize(option.label).includes(normalizedQuery),
                  )
                : options,
        [normalizedQuery, options],
    );

    const trimmedQuery = query?.trim() ?? '';
    const hasExactMatch = options.some(
        (option) => normalize(option.label) === normalize(trimmedQuery),
    );
    const showCreateOption =
        Boolean(onCreateOption) && trimmedQuery !== '' && !hasExactMatch;
    const itemCount = filteredOptions.length + (showCreateOption ? 1 : 0);

    const close = React.useCallback(() => {
        setIsOpen(false);
        setQuery(null);
    }, []);

    React.useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleMouseDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                close();
            }
        };

        document.addEventListener('mousedown', handleMouseDown);

        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [close, isOpen]);

    React.useEffect(() => {
        listRef.current
            ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
            ?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    const open = () => {
        if (disabled) {
            return;
        }

        const selectedIndex = filteredOptions.findIndex(
            (option) => option.value === value,
        );
        setActiveIndex(Math.max(selectedIndex, 0));
        setIsOpen(true);
    };

    const selectOption = (option: FieldOption) => {
        onChange(option.value);
        close();
    };

    const createFromQuery = () => {
        onCreateOption?.(trimmedQuery);
        close();
    };

    const chooseActive = () => {
        if (activeIndex < filteredOptions.length) {
            selectOption(filteredOptions[activeIndex]);

            return;
        }

        if (showCreateOption) {
            createFromQuery();
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();

            if (!isOpen) {
                open();

                return;
            }

            if (itemCount === 0) {
                return;
            }

            setActiveIndex((current) =>
                event.key === 'ArrowDown'
                    ? (current + 1) % itemCount
                    : (current - 1 + itemCount) % itemCount,
            );

            return;
        }

        if (event.key === 'Enter' && isOpen) {
            event.preventDefault();
            chooseActive();

            return;
        }

        if (event.key === 'Escape' && isOpen) {
            event.preventDefault();
            close();
        }
    };

    const displayValue = isSearching ? query : (selectedOption?.label ?? '');
    const activeOptionId =
        isOpen && itemCount > 0 ? `${listboxId}-${activeIndex}` : undefined;

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <Input
                id={inputId}
                role="combobox"
                aria-label={ariaLabel}
                aria-expanded={isOpen}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={activeOptionId}
                aria-invalid={invalid || undefined}
                autoComplete="off"
                value={displayValue}
                placeholder={selectedOption?.label ?? placeholder}
                disabled={disabled}
                onChange={(event) => {
                    setQuery(event.currentTarget.value);
                    setActiveIndex(0);
                    setIsOpen(true);
                }}
                onFocus={open}
                onClick={open}
                onKeyDown={handleKeyDown}
                className={cn(
                    value && !disabled ? 'pr-16' : 'pr-9',
                    inputClassName,
                )}
            />

            <div className="absolute inset-y-0 right-1 flex items-center gap-0.5">
                {value && !disabled ? (
                    <button
                        type="button"
                        aria-label="Limpar seleção"
                        onClick={() => {
                            onChange('');
                            close();
                        }}
                        className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <X className="size-4" />
                    </button>
                ) : null}
                <ChevronDown
                    aria-hidden
                    className={cn(
                        'mr-1.5 size-4 text-muted-foreground transition-transform',
                        isOpen && 'rotate-180',
                    )}
                />
            </div>

            {isOpen ? (
                <ul
                    ref={listRef}
                    id={listboxId}
                    role="listbox"
                    className="absolute top-full z-50 mt-1 max-h-56 w-full min-w-48 overflow-y-auto rounded-md border bg-popover p-1 shadow-md"
                >
                    {filteredOptions.map((option, index) => {
                        const isSelected = option.value === value;

                        return (
                            <li
                                key={option.value}
                                id={`${listboxId}-${index}`}
                                data-index={index}
                                role="option"
                                aria-selected={isSelected}
                                onMouseDown={(event) => event.preventDefault()}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => selectOption(option)}
                                className={cn(
                                    'flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2.5 py-2 text-sm',
                                    index === activeIndex && 'bg-muted',
                                    isSelected && 'font-medium',
                                )}
                            >
                                <span className="truncate">{option.label}</span>
                                {isSelected ? (
                                    <Check
                                        aria-hidden
                                        className="size-4 shrink-0 text-accent"
                                    />
                                ) : null}
                            </li>
                        );
                    })}

                    {showCreateOption ? (
                        <li
                            id={`${listboxId}-${filteredOptions.length}`}
                            data-index={filteredOptions.length}
                            role="option"
                            aria-selected={false}
                            onMouseDown={(event) => event.preventDefault()}
                            onMouseEnter={() =>
                                setActiveIndex(filteredOptions.length)
                            }
                            onClick={createFromQuery}
                            className={cn(
                                'flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-sm text-accent',
                                activeIndex === filteredOptions.length &&
                                    'bg-muted',
                            )}
                        >
                            <Plus aria-hidden className="size-4 shrink-0" />
                            <span className="truncate">
                                {createOptionLabel(trimmedQuery)}
                            </span>
                        </li>
                    ) : null}

                    {itemCount === 0 ? (
                        <li className="px-2.5 py-2 text-sm text-muted-foreground">
                            {emptyMessage}
                        </li>
                    ) : null}
                </ul>
            ) : null}
        </div>
    );
}
