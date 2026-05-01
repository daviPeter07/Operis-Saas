import * as React from 'react';
import { DatePickerInput } from '@/components/date/date-picker-input';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PAYMENT_METHOD_OPTIONS } from '@/constants/payment-methods';
import { STATUS_OPTIONS } from '@/constants/status';
import type { FinancialEntryForm } from '@/types/dashboard-forms';
import type { Supplier } from '@/lib/mocks/mock-data';
import { UserPlus } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

type FinancialEntryDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    primarySectionTitle: string;
    submitLabel: string;
    form: FinancialEntryForm;
    onChange: <K extends keyof FinancialEntryForm>(
        key: K,
        value: FinancialEntryForm[K],
    ) => void;
    onSubmit: () => void;
    extraSection?: JSX.Element;
    suppliers?: Supplier[];
    onCreateSupplier?: (supplierName: string) => void;
};

export function FinancialEntryDialog({
    open,
    onOpenChange,
    title,
    description,
    primarySectionTitle,
    submitLabel,
    form,
    onChange,
    onSubmit,
    extraSection,
    suppliers = [],
    onCreateSupplier,
}: FinancialEntryDialogProps) {
    const [supplierSearch, setSupplierSearch] = React.useState('');
    const selectedSupplier = suppliers.find(
        (supplier) => supplier.name === form.supplierName,
    );
    const filteredSuppliers = React.useMemo(() => {
        const normalizedQuery = supplierSearch.trim().toLowerCase();

        if (!normalizedQuery) {
            return suppliers;
        }

        return suppliers.filter((supplier) =>
            supplier.name.toLowerCase().includes(normalizedQuery),
        );
    }, [supplierSearch, suppliers]);

    React.useEffect(() => {
        if (!open) {
            setSupplierSearch('');
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[calc(100vw-2rem)] sm:!max-w-[980px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-6"
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit();
                    }}
                >
                    <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <h3 className="text-sm font-semibold">
                                {primarySectionTitle}
                            </h3>
                        </div>

                        <div className="grid gap-2 sm:col-span-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="financial-supplier">Fornecedor *</Label>
                                {onCreateSupplier ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                disabled={
                                                    supplierSearch.trim().length ===
                                                    0
                                                }
                                                onClick={() =>
                                                    onCreateSupplier(
                                                        supplierSearch.trim(),
                                                    )
                                                }
                                            >
                                                <UserPlus className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Criar fornecedor
                                        </TooltipContent>
                                    </Tooltip>
                                ) : null}
                            </div>
                            <SearchableSelect
                                value={selectedSupplier?.id || ''}
                                searchValue={supplierSearch}
                                onSearchChange={(value) => {
                                    if (
                                        selectedSupplier &&
                                        value !== selectedSupplier.name
                                    ) {
                                        onChange('supplierName', '');
                                    }

                                    setSupplierSearch(value);
                                }}
                                onChange={(value) => {
                                    const supplier = suppliers.find(
                                        (item) => item.id === value,
                                    );
                                    onChange('supplierName', supplier?.name || '');
                                    setSupplierSearch(supplier?.name || '');
                                }}
                                options={filteredSuppliers.map((supplier) => ({
                                    value: supplier.id,
                                    label: supplier.name,
                                }))}
                                placeholder="Buscar fornecedor"
                                emptyMessage="Nenhum fornecedor encontrado."
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="financial-items">Itens *</Label>
                            <Input
                                id="financial-items"
                                type="number"
                                min="1"
                                value={form.items}
                                onChange={(event) =>
                                    onChange('items', event.target.value)
                                }
                                placeholder="Quantidade de itens"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="financial-total">Total *</Label>
                            <Input
                                id="financial-total"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.total}
                                onChange={(event) =>
                                    onChange('total', event.target.value)
                                }
                                placeholder="Valor total"
                                required
                            />
                        </div>
                    </div>

                    {extraSection}

                    <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <h3 className="text-sm font-semibold">
                                Pagamento e datas
                            </h3>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="financial-method">
                                Metodo de pagamento *
                            </Label>
                            <Select
                                value={form.paymentMethod}
                                onValueChange={(value) =>
                                    onChange('paymentMethod', value)
                                }
                            >
                                <SelectTrigger id="financial-method">
                                    <SelectValue placeholder="Metodo de pagamento" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAYMENT_METHOD_OPTIONS.filter(
                                        (option) =>
                                            option.value === 'money' ||
                                            option.value === 'pix' ||
                                            option.value === 'credit' ||
                                            option.value === 'debit',
                                    ).map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="financial-status">Status *</Label>
                            <Select
                                value={form.status}
                                onValueChange={(value) =>
                                    onChange('status', value)
                                }
                            >
                                <SelectTrigger id="financial-status">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Data *</Label>
                            <DatePickerInput
                                value={form.createdAt}
                                onChange={(value) => onChange('createdAt', value)}
                                placeholder="Selecionar data"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">{submitLabel}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
