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
import type { UiSupplier } from '@/types/dashboard-entities';
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
    suppliers?: UiSupplier[];
    onOpenCreateSupplier?: () => void;
    partyLabel?: string;
    partySearchPlaceholder?: string;
    partyEmptyMessage?: string;
    partyCreateTooltip?: string;
    primarySectionDescription?: string;
    showOperationSummary?: boolean;
    showStatusField?: boolean;
    hideCatalogHeader?: boolean;
    cartSection?: React.ReactNode;
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
    onOpenCreateSupplier,
    partyLabel = 'Fornecedor',
    partySearchPlaceholder = 'Buscar fornecedor',
    partyEmptyMessage = 'Nenhum fornecedor encontrado.',
    partyCreateTooltip = 'Criar fornecedor',
    primarySectionDescription = 'Fornecedor, pagamento e fechamento operacional.',
    showOperationSummary = true,
    showStatusField = true,
    hideCatalogHeader = false,
    cartSection,
}: FinancialEntryDialogProps) {
    const hasCatalogSection = Boolean(catalogSection);
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
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSupplierSearch('');
        }
    }, [open]);

    React.useEffect(() => {
        if (
            selectedSupplier &&
            form.supplierName === selectedSupplier.name &&
            supplierSearch !== selectedSupplier.name
        ) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSupplierSearch(selectedSupplier.name);
        }
    }, [form.supplierName, selectedSupplier, supplierSearch]);

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
                    <section className="flex min-h-0 flex-col border-r bg-background">
                        {hideCatalogHeader ? null : (
                            <div className="border-b px-5 py-4">
                                <DialogHeader className="text-left">
                                    <DialogTitle className="text-xl">
                                        {title}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {description}
                                    </DialogDescription>
                                </DialogHeader>
                            </div>
                        )}
                        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                            {catalogSection ?? (
                                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                    Nenhum item adicional para listar.
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="flex min-h-0 flex-col bg-card">
                        <div className="border-b px-5 py-4">
                            <DialogHeader className="text-left">
                                <DialogTitle className="text-lg">
                                    {primarySectionTitle}
                                </DialogTitle>
                                <DialogDescription>
                                    {primarySectionDescription}
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                            <div className="space-y-4">
                                <Card className="border-border/70 shadow-none">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm">
                                                {partyLabel}{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </CardTitle>
                                            {onOpenCreateSupplier ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            onClick={
                                                                onOpenCreateSupplier
                                                            }
                                                        >
                                                            <UserPlus className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {partyCreateTooltip}
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
                                            placeholder={partySearchPlaceholder}
                                            emptyMessage={partyEmptyMessage}
                                        />
                                    </CardContent>
                                </Card>

                                {cartSection}

                                {showOperationSummary ? (
                                    <Card className="border-border/70 shadow-none">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">
                                                Resumo da operacao
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="rounded-lg border bg-muted/30 p-3">
                                                    <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                                        Itens
                                                    </p>
                                                    {hasCatalogSection ? (
                                                        <>
                                                            <p className="mt-1 text-2xl font-semibold">
                                                                {form.items ||
                                                                    '0'}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Quantidade total
                                                                no carrinho.
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <div className="mt-2 grid gap-2">
                                                            <Label htmlFor="financial-items">
                                                                Itens *
                                                            </Label>
                                                            <Input
                                                                id="financial-items"
                                                                type="number"
                                                                min="1"
                                                                value={
                                                                    form.items
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    onChange(
                                                                        'items',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                required
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="rounded-lg border bg-muted/30 p-3">
                                                    <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                                        Total
                                                    </p>
                                                    {hasCatalogSection ? (
                                                        <>
                                                            <p className="mt-1 text-2xl font-semibold">
                                                                {formatCurrencyBR(
                                                                    Number(
                                                                        form.total ||
                                                                            0,
                                                                    ),
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Calculado a
                                                                partir dos
                                                                custos por
                                                                linha.
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <div className="mt-2 grid gap-2">
                                                            <Label htmlFor="financial-total">
                                                                Total *
                                                            </Label>
                                                            <Input
                                                                id="financial-total"
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={
                                                                    form.total
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    onChange(
                                                                        'total',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                required
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {showStatusField ? (
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="financial-status">
                                                            Status *
                                                        </Label>
                                                        <Select
                                                            value={form.status}
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                onChange(
                                                                    'status',
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger id="financial-status">
                                                                <SelectValue placeholder="Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {STATUS_OPTIONS.map(
                                                                    (
                                                                        option,
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                option.value
                                                                            }
                                                                            value={
                                                                                option.value
                                                                            }
                                                                        >
                                                                            {
                                                                                option.label
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                ) : null}

                                                <div className="grid gap-2">
                                                    <Label>Data *</Label>
                                                    <DatePickerInput
                                                        value={form.createdAt}
                                                        onChange={(value) =>
                                                            onChange(
                                                                'createdAt',
                                                                value,
                                                            )
                                                        }
                                                        placeholder="Selecionar data"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : null}

                                <Card className="border-border/70 shadow-none">
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
                                                    value === 'card' ||
                                                    value === 'boleto'
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
                                                    option.value === 'card' ||
                                                    option.value === 'boleto',
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
                                    <Card className="border-border/70 shadow-none">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">
                                                Detalhes do cartao
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

                                {form.paymentMethod === 'boleto' ? (
                                    <Card className="border-border/70 shadow-none">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">
                                                Prazo do boleto
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-2">
                                            <Label htmlFor="boleto-term-days">
                                                Prazo *
                                            </Label>
                                            <Select
                                                value={form.boletoTermDays}
                                                onValueChange={(value) =>
                                                    onChange(
                                                        'boletoTermDays',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger id="boleto-term-days">
                                                    <SelectValue placeholder="Selecione o prazo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[30, 60, 90, 120].map(
                                                        (days) => (
                                                            <SelectItem
                                                                key={days}
                                                                value={String(
                                                                    days,
                                                                )}
                                                            >
                                                                {days} dias
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </CardContent>
                                    </Card>
                                ) : null}

                                <div className="space-y-2 rounded-xl border p-3">
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
