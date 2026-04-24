import * as React from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
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
    className?: string;
}

const operatorLabels: Record<FilterOperator, string> = {
    eq: 'É igual a',
    neq: 'É diferente de',
    gt: 'É maior que',
    gte: 'É maior ou igual a',
    lt: 'É menor que',
    lte: 'É menor ou igual a',
    contains: 'Contém',
    in: 'Está em',
};

export function FilterSidebar({
    open,
    onOpenChange,
    fields,
    activeFilters = [],
    onAddFilter,
    onRemoveFilter,
    onClearFilters,
    className,
}: FilterSidebarProps) {
    const [selectedField, setSelectedField] = React.useState<string>('');
    const [selectedOperator, setSelectedOperator] =
        React.useState<FilterOperator>('contains');
    const [filterValue, setFilterValue] = React.useState<string>('');

    const handleAddFilter = () => {
        if (!selectedField || !filterValue) return;

        onAddFilter?.({
            field: selectedField,
            operator: selectedOperator,
            value: filterValue,
        });

        setSelectedField('');
        setFilterValue('');
    };

    const selectedFieldConfig = fields.find((f) => f.key === selectedField);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:max-w-[400px]">
                <SheetHeader className="sticky top-0 z-10 bg-background pb-4">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtros
                        </SheetTitle>
                        {activeFilters.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClearFilters}
                                className="gap-2 text-muted-foreground"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Limpar
                            </Button>
                        )}
                    </div>
                </SheetHeader>

                <div className="flex flex-col gap-6 pt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Campo</Label>
                            <Select
                                value={selectedField}
                                onValueChange={setSelectedField}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um campo" />
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

                        <div className="space-y-2">
                            <Label>Condição</Label>
                            <Select
                                value={selectedOperator}
                                onValueChange={(v) =>
                                    setSelectedOperator(v as FilterOperator)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(selectedFieldConfig?.type === 'text' ||
                                        !selectedFieldConfig) && (
                                        <>
                                            <SelectItem value="contains">
                                                Contém
                                            </SelectItem>
                                            <SelectItem value="eq">
                                                É igual a
                                            </SelectItem>
                                            <SelectItem value="neq">
                                                É diferente de
                                            </SelectItem>
                                        </>
                                    )}
                                    {(selectedFieldConfig?.type === 'number' ||
                                        !selectedFieldConfig) && (
                                        <>
                                            <SelectItem value="eq">
                                                É igual a
                                            </SelectItem>
                                            <SelectItem value="neq">
                                                É diferente de
                                            </SelectItem>
                                            <SelectItem value="gt">
                                                É maior que
                                            </SelectItem>
                                            <SelectItem value="gte">
                                                É maior ou igual a
                                            </SelectItem>
                                            <SelectItem value="lt">
                                                É menor que
                                            </SelectItem>
                                            <SelectItem value="lte">
                                                É menor ou igual a
                                            </SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Valor</Label>
                            {selectedFieldConfig?.type === 'select' ? (
                                <Select
                                    value={filterValue}
                                    onValueChange={setFilterValue}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um valor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedFieldConfig.options?.map(
                                            (opt) => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    type={
                                        selectedFieldConfig?.type === 'number'
                                            ? 'number'
                                            : 'text'
                                    }
                                    placeholder="Digite o valor"
                                    value={filterValue}
                                    onChange={(e) =>
                                        setFilterValue(e.target.value)
                                    }
                                />
                            )}
                        </div>

                        <Button
                            onClick={handleAddFilter}
                            disabled={!selectedField || !filterValue}
                            className="w-full"
                        >
                            Adicionar Filtro
                        </Button>
                    </div>

                    {activeFilters.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">
                                Filtros ativos
                            </Label>
                            <div className="space-y-2">
                                {activeFilters.map((filter) => {
                                    const fieldConfig = fields.find(
                                        (f) => f.key === filter.field,
                                    );
                                    return (
                                        <div
                                            key={filter.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium">
                                                    {fieldConfig?.label ||
                                                        filter.field}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {
                                                        operatorLabels[
                                                            filter.operator
                                                        ]
                                                    }{' '}
                                                    "{filter.value}"
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() =>
                                                    onRemoveFilter?.(filter.id)
                                                }
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
