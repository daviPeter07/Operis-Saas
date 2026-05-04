import { UserPlus } from 'lucide-react';
import * as React from 'react';
import { DatePickerInput } from '@/components/date/date-picker-input';
import { CardPaymentFields } from '@/components/payment/card-payment-fields';
import { SearchableSelect } from '@/components/searchable-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { PAYMENT_METHOD_OPTIONS } from '@/constants/payment-methods';
import { STATUS_OPTIONS } from '@/constants/status';
import { formatCurrencyBR } from '@/lib/format';
import type { Supplier } from '@/lib/mocks/mock-data';
import type { FinancialEntryForm } from '@/types/dashboard-forms';

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
    catalogSection?: React.ReactNode;
    summaryLabel?: string;
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
    catalogSection,
    summaryLabel = 'Total',
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
            <DialogContent className="max-w-[min(1700px,calc(100vw-1rem))] overflow-y-auto p-0 sm:max-w-[min(1700px,calc(100vw-1rem))]">
                <form
                    className="grid max-h-[calc(100dvh-1rem)] min-h-[calc(100dvh-1rem)] grid-cols-1 lg:h-[min(90dvh,calc(100dvh-1rem))] lg:grid-cols-[1.35fr_0.65fr]"
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit();
                    }}
                >
                    <section className="flex min-h-0 flex-col border-r">
                        <div className="border-b p-4">
                            <DialogHeader className="text-left">
                                <DialogTitle>{title}</DialogTitle>
                                <DialogDescription>
                                    {description}
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto p-4">
                            {catalogSection ?? (
                                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                    Nenhum item adicional para listar.
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="flex min-h-0 flex-col bg-card">
                        <div className="border-b p-4">
                            <DialogHeader className="text-left">
                                <DialogTitle className="text-lg">
                                    {primarySectionTitle}
                                </DialogTitle>
                                <DialogDescription>
                                    Fornecedor, pagamento e fechamento.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-4">
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm">
                                                Fornecedor
                                            </CardTitle>
                                            {onCreateSupplier ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            disabled={
                                                                supplierSearch.trim()
                                                                    .length ===
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
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <SearchableSelect
                                            value={selectedSupplier?.id || ''}
                                            searchValue={supplierSearch}
                                            onSearchChange={(value) => {
                                                if (
                                                    selectedSupplier &&
                                                    value !==
                                                        selectedSupplier.name
                                                ) {
                                                    onChange(
                                                        'supplierName',
                                                        '',
                                                    );
                                                }

                                                setSupplierSearch(value);
                                            }}
                                            onChange={(value) => {
                                                const supplier = suppliers.find(
                                                    (item) => item.id === value,
                                                );
                                                onChange(
                                                    'supplierName',
                                                    supplier?.name || '',
                                                );
                                                setSupplierSearch(
                                                    supplier?.name || '',
                                                );
                                            }}
                                            options={filteredSuppliers.map(
                                                (supplier) => ({
                                                    value: supplier.id,
                                                    label: supplier.name,
                                                }),
                                            )}
                                            placeholder="Buscar fornecedor"
                                            emptyMessage="Nenhum fornecedor encontrado."
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">
                                            Valores
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-3 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="financial-items">
                                                Itens *
                                            </Label>
                                            <Input
                                                id="financial-items"
                                                type="number"
                                                min="1"
                                                value={form.items}
                                                onChange={(event) =>
                                                    onChange(
                                                        'items',
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="financial-total">
                                                Total *
                                            </Label>
                                            <Input
                                                id="financial-total"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={form.total}
                                                onChange={(event) =>
                                                    onChange(
                                                        'total',
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">
                                            Forma de pagamento
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ToggleGroup
                                            type="single"
                                            value={form.paymentMethod}
                                            onValueChange={(value) => {
                                                if (
                                                    value === 'money' ||
                                                    value === 'pix' ||
                                                    value === 'card'
                                                ) {
                                                    onChange(
                                                        'paymentMethod',
                                                        value,
                                                    );
                                                }
                                            }}
                                            className="grid grid-cols-2 gap-2"
                                        >
                                            {PAYMENT_METHOD_OPTIONS.filter(
                                                (option) =>
                                                    option.value === 'money' ||
                                                    option.value === 'pix' ||
                                                    option.value === 'card',
                                            ).map((option) => (
                                                <ToggleGroupItem
                                                    key={option.value}
                                                    value={option.value}
                                                    variant="outline"
                                                    className="rounded-md border"
                                                >
                                                    {option.label}
                                                </ToggleGroupItem>
                                            ))}
                                        </ToggleGroup>
                                    </CardContent>
                                </Card>

                                {form.paymentMethod === 'card' ? (
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">
                                                Detalhes do cartão
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardPaymentFields
                                                cardType={form.cardType}
                                                onCardTypeChange={(value) =>
                                                    onChange('cardType', value)
                                                }
                                                installments={form.installments}
                                                onInstallmentsChange={(value) =>
                                                    onChange(
                                                        'installments',
                                                        value,
                                                    )
                                                }
                                                firstInstallmentDate={
                                                    form.firstInstallmentDate
                                                }
                                                onFirstInstallmentDateChange={(
                                                    value,
                                                ) =>
                                                    onChange(
                                                        'firstInstallmentDate',
                                                        value,
                                                    )
                                                }
                                                totalAmount={Number(
                                                    form.total || 0,
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                ) : null}

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">
                                            Status e data
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="financial-status">
                                                Status *
                                            </Label>
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
                                                    {STATUS_OPTIONS.map(
                                                        (option) => (
                                                            <SelectItem
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Data *</Label>
                                            <DatePickerInput
                                                value={form.createdAt}
                                                onChange={(value) =>
                                                    onChange('createdAt', value)
                                                }
                                                placeholder="Selecionar data"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="space-y-2 rounded-md border p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold">
                                            {summaryLabel}
                                        </span>
                                        <span className="text-2xl font-black text-primary">
                                            {formatCurrencyBR(
                                                Number(form.total || 0),
                                            )}
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => onOpenChange(false)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1"
                                        >
                                            {submitLabel}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </form>
            </DialogContent>
        </Dialog>
    );
}
