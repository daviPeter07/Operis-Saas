import {
    X,
    Filter,
    Plus,
    SlidersHorizontal,
    CheckCircle2,
    Circle,
    ArrowDownAZ,
    ArrowUpZA,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import type { FilterOperator } from '@/hooks/use-table-filters';

export interface FilterField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'date';
    options?: { value: string; label: string }[];
}

export interface ActiveFilter {
    id: string;
    field: string;
    operator: FilterOperator;
    value: string | number | null;
}

export interface FilterSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fields: FilterField[];
    activeFilters?: ActiveFilter[];
    onAddFilter?: (filter: Omit<ActiveFilter, 'id'>) => void;
    onRemoveFilter?: (id: string) => void;
    onClearFilters?: () => void;
    sortFields?: { key: string; label: string }[];
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
    className?: string;
}

const operatorLabels: Record<FilterOperator, string> = {
    eq: 'igual a',
    neq: 'diferente de',
    gt: 'maior que',
    gte: 'maior ou igual a',
    lt: 'menor que',
    lte: 'menor ou igual a',
    contains: 'contém',
    in: 'está em',
};

export function FilterSidebar({
    open,
    onOpenChange,
    fields,
    activeFilters = [],
    onAddFilter,
    onRemoveFilter,
    onClearFilters,
    sortFields = [],
    sortBy = '',
    sortDirection = 'asc',
    onSortChange,
    className,
}: FilterSidebarProps) {
    const [selectedField, setSelectedField] = React.useState<string>('');
    const [selectedOperator, setSelectedOperator] =
        React.useState<FilterOperator>('contains');
    const [filterValue, setFilterValue] = React.useState<string>('');

    const handleAddFilter = () => {
        if (!selectedField || !filterValue) {
            return;
        }

        onAddFilter?.({
            field: selectedField,
            operator: selectedOperator,
            value: filterValue,
        });

        setSelectedField('');
        setFilterValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddFilter();
        }
    };

    const selectedFieldConfig = fields.find((f) => f.key === selectedField);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex w-[400px] flex-col gap-0 p-0 sm:max-w-[400px]">
                <SheetHeader className="shrink-0 border-b px-6 py-5 pr-14">
                    <SheetTitle className="flex items-center gap-3 text-lg">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-muted">
                            <SlidersHorizontal className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span>Filtros</span>
                            {activeFilters.length > 0 && (
                                <span className="text-xs font-normal text-muted-foreground">
                                    {activeFilters.length} filtro
                                    {activeFilters.length !== 1 ? 's' : ''}{' '}
                                    ativo
                                    {activeFilters.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="space-y-6">
                        {sortFields.length > 0 && onSortChange && (
                            <div className="rounded-xl border bg-card p-4 shadow-xs">
                                <div className="mb-3 flex items-center justify-between">
                                    <Label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Ordenação
                                    </Label>
                                    {sortBy && (
                                        <Badge
                                            variant="outline"
                                            className="text-[10px]"
                                        >
                                            {sortDirection === 'asc'
                                                ? 'A-Z'
                                                : 'Z-A'}
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Select
                                        value={sortBy || 'none'}
                                        onValueChange={(field) =>
                                            onSortChange(
                                                field === 'none' ? '' : field,
                                                sortDirection,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-11 bg-muted/50">
                                            <SelectValue placeholder="Ordenar por" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Sem ordenação
                                            </SelectItem>
                                            {sortFields.map((field) => (
                                                <SelectItem
                                                    key={field.key}
                                                    value={field.key}
                                                >
                                                    {field.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            type="button"
                                            variant={
                                                sortDirection === 'asc'
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            className="gap-2"
                                            onClick={() =>
                                                onSortChange(sortBy, 'asc')
                                            }
                                        >
                                            <ArrowDownAZ className="h-4 w-4" />
                                            A-Z
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={
                                                sortDirection === 'desc'
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            className="gap-2"
                                            onClick={() =>
                                                onSortChange(sortBy, 'desc')
                                            }
                                        >
                                            <ArrowUpZA className="h-4 w-4" />
                                            Z-A
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-3">
                                <Label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                    Novo Filtro
                                </Label>

                                <Select
                                    value={selectedField}
                                    onValueChange={(val) => {
                                        setSelectedField(val);
                                        const field = fields.find(
                                            (f) => f.key === val,
                                        );

                                        if (field?.type === 'select') {
                                            setSelectedOperator('eq');
                                        } else if (field?.type === 'number') {
                                            setSelectedOperator('eq');
                                        } else {
                                            setSelectedOperator('contains');
                                        }
                                    }}
                                >
                                    <SelectTrigger className="h-11 bg-muted/50">
                                        <SelectValue placeholder="Selecione um campo para filtrar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fields.map((field) => (
                                            <SelectItem
                                                key={field.key}
                                                value={field.key}
                                            >
                                                {field.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedField && (
                                <div className="animate-in space-y-3 duration-200 slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">
                                            Condição
                                        </Label>
                                        <Select
                                            value={selectedOperator}
                                            onValueChange={(v) =>
                                                setSelectedOperator(
                                                    v as FilterOperator,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-11 bg-muted/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(selectedFieldConfig?.type ===
                                                    'text' ||
                                                    !selectedFieldConfig) && (
                                                    <>
                                                        <SelectItem value="contains">
                                                            <span className="flex items-center gap-2">
                                                                <span>∼</span>{' '}
                                                                Contém
                                                            </span>
                                                        </SelectItem>
                                                        <SelectItem value="eq">
                                                            <span className="flex items-center gap-2">
                                                                <CheckCircle2 className="h-3 w-3" />{' '}
                                                                É igual a
                                                            </span>
                                                        </SelectItem>
                                                        <SelectItem value="neq">
                                                            <span className="flex items-center gap-2">
                                                                <Circle className="h-3 w-3" />{' '}
                                                                É diferente de
                                                            </span>
                                                        </SelectItem>
                                                    </>
                                                )}
                                                {(selectedFieldConfig?.type ===
                                                    'number' ||
                                                    !selectedFieldConfig) && (
                                                    <>
                                                        <SelectItem value="eq">
                                                            = É igual a
                                                        </SelectItem>
                                                        <SelectItem value="neq">
                                                            ≠ É diferente de
                                                        </SelectItem>
                                                        <SelectItem value="gt">
                                                            &gt; Maior que
                                                        </SelectItem>
                                                        <SelectItem value="gte">
                                                            ≥ Maior ou igual
                                                        </SelectItem>
                                                        <SelectItem value="lt">
                                                            &lt; Menor que
                                                        </SelectItem>
                                                        <SelectItem value="lte">
                                                            ≤ Menor ou igual
                                                        </SelectItem>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">
                                            Valor
                                        </Label>
                                        {selectedFieldConfig?.type ===
                                        'select' ? (
                                            <Select
                                                value={filterValue}
                                                onValueChange={setFilterValue}
                                            >
                                                <SelectTrigger className="h-11 bg-muted/50">
                                                    <SelectValue placeholder="Selecione um valor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {selectedFieldConfig.options
                                                        ?.sort((a, b) =>
                                                            a.label.localeCompare(
                                                                b.label,
                                                                'pt-BR',
                                                            ),
                                                        )
                                                        .map((opt) => (
                                                            <SelectItem
                                                                key={opt.value}
                                                                value={
                                                                    opt.value
                                                                }
                                                            >
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                type={
                                                    selectedFieldConfig?.type ===
                                                    'number'
                                                        ? 'number'
                                                        : 'text'
                                                }
                                                placeholder={
                                                    selectedFieldConfig?.type ===
                                                    'number'
                                                        ? 'Digite um número'
                                                        : 'Digite um valor'
                                                }
                                                value={filterValue}
                                                onChange={(e) =>
                                                    setFilterValue(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={handleKeyDown}
                                                className="h-11 bg-muted/50"
                                            />
                                        )}
                                    </div>

                                    <Button
                                        onClick={handleAddFilter}
                                        disabled={
                                            !selectedField || !filterValue
                                        }
                                        className="h-11 w-full gap-2"
                                        size="sm"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Adicionar Filtro
                                    </Button>
                                </div>
                            )}
                        </div>

                        {activeFilters.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Filtros Ativos
                                    </Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClearFilters}
                                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Limpar todos
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {activeFilters.map((filter) => {
                                        const fieldConfig = fields.find(
                                            (f) => f.key === filter.field,
                                        );

                                        return (
                                            <Badge
                                                key={filter.id}
                                                variant="secondary"
                                                className="flex items-center gap-2 px-3 py-1.5 pr-1"
                                            >
                                                <span className="flex flex-col items-start">
                                                    <span className="text-xs font-medium">
                                                        {fieldConfig?.label ||
                                                            filter.field}
                                                    </span>
                                                    <span className="text-[10px] opacity-70">
                                                        {
                                                            operatorLabels[
                                                                filter.operator
                                                            ]
                                                        }{' '}
                                                        <span className="font-semibold">
                                                            "{filter.value}"
                                                        </span>
                                                    </span>
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5"
                                                    onClick={() =>
                                                        onRemoveFilter?.(
                                                            filter.id,
                                                        )
                                                    }
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeFilters.length === 0 && !selectedField && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                    <Filter className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="mt-4 text-sm font-medium">
                                    Nenhum filtro aplicado
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Selecione um campo acima para adicionar
                                    filtros
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
