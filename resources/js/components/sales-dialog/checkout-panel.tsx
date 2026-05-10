import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, Trash2, UserPlus } from 'lucide-react';
import * as React from 'react';
import { CardPaymentFields } from '@/components/payment/card-payment-fields';
import { SearchableSelect } from '@/components/searchable-select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCurrencyBR } from '@/lib/format';
import type { UiCustomer as Client } from '@/types/dashboard-entities';
import type { SalesLineItem } from '@/types/sales-dialog';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/form-fields';
import { paymentMethodOptions } from '@/utils/sales-dialog';

function parseLocalDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);

    return new Date(year, (month || 1) - 1, day || 1);
}

interface CheckoutPanelProps {
    clientSearch: string;
    setClientSearch: (value: string) => void;
    filteredClients: Client[];
    selectedClient: Client | null | undefined;
    selectClientById: (id: string) => void;
    openCreateClient: () => void;
    lineItems: SalesLineItem[];
    increaseLineItemQuantity: (id: string) => void;
    decreaseLineItemQuantity: (id: string) => void;
    removeLineItem: (id: string) => void;
    paymentMethod: 'money' | 'pix' | 'card' | 'crediario';
    setPaymentMethod: (value: 'money' | 'pix' | 'card' | 'crediario') => void;
    cardType: 'debit' | 'credit';
    setCardType: (value: 'debit' | 'credit') => void;
    installments: string;
    setInstallments: (value: string) => void;
    crediarioEntry: string;
    setCrediarioEntry: (value: string) => void;
    firstInstallmentDate: string;
    setFirstInstallmentDate: (value: string) => void;
    total: number;
    discountAmountApplied: number;
    finalTotal: number;
    openDiscountDialog: () => void;
    notes: string;
    setNotes: (value: string) => void;
    saleDate: string;
    calendarOpen: boolean;
    setCalendarOpen: (open: boolean) => void;
    setSaleDate: (value: string) => void;
    availableCredit?: number;
    crediarioExceeded: boolean;
    maxCrediarioInstallments: number;
    onOpenEditClient: () => void;
    canSubmit: boolean;
    onSubmit: () => void;
}

export function CheckoutPanel({
    clientSearch,
    setClientSearch,
    filteredClients,
    selectedClient,
    selectClientById,
    openCreateClient,
    lineItems,
    increaseLineItemQuantity,
    decreaseLineItemQuantity,
    removeLineItem,
    paymentMethod,
    setPaymentMethod,
    cardType,
    setCardType,
    installments,
    setInstallments,
    crediarioEntry,
    setCrediarioEntry,
    firstInstallmentDate,
    setFirstInstallmentDate,
    total,
    discountAmountApplied,
    finalTotal,
    openDiscountDialog,
    notes,
    setNotes,
    saleDate,
    calendarOpen,
    setCalendarOpen,
    setSaleDate,
    availableCredit,
    crediarioExceeded,
    maxCrediarioInstallments,
    onOpenEditClient,
    canSubmit,
    onSubmit,
}: CheckoutPanelProps) {
    const calendarContainerRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (!calendarOpen) {
            return;
        }

        const handleOutsideClick = (event: MouseEvent) => {
            if (
                calendarContainerRef.current &&
                !calendarContainerRef.current.contains(event.target as Node)
            ) {
                setCalendarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [calendarOpen, setCalendarOpen]);

    React.useEffect(() => {
        if (paymentMethod === 'crediario' && cardType !== 'credit') {
            setCardType('credit');
        }
    }, [paymentMethod, cardType, setCardType]);

    const crediarioEntryValue = Math.max(0, parseCurrencyInput(crediarioEntry));
    const financedAmount = Math.max(0, finalTotal - crediarioEntryValue);
    const isCrediarioEntryInvalid =
        paymentMethod === 'crediario' &&
        (!(crediarioEntryValue > 0) || crediarioEntryValue >= finalTotal);

    return (
        <section className="flex min-h-0 flex-col bg-card">
            <div className="border-b p-4">
                <DialogHeader className="text-left">
                    <DialogTitle className="text-lg">
                        Finalizar venda
                    </DialogTitle>
                    <DialogDescription>
                        Cliente, itens, pagamento e fechamento.
                    </DialogDescription>
                </DialogHeader>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">
                                    Cliente
                                </CardTitle>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            onClick={openCreateClient}
                                        >
                                            <UserPlus className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Criar cliente
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <SearchableSelect
                                value={selectedClient?.id || ''}
                                searchValue={clientSearch}
                                onSearchChange={(value) => {
                                    if (
                                        selectedClient &&
                                        value !== selectedClient.name
                                    ) {
                                        selectClientById('');
                                    }

                                    setClientSearch(value);
                                }}
                                onChange={(value) => selectClientById(value)}
                                options={filteredClients.map((client) => ({
                                    value: client.id,
                                    label: client.name,
                                }))}
                                placeholder="Buscar cliente"
                                emptyMessage="Nenhum cliente encontrado."
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Carrinho</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {lineItems.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Nenhum item no carrinho.
                                </p>
                            ) : (
                                lineItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-md border p-2"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {item.productName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatCurrencyBR(
                                                        item.unitPrice,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() =>
                                                                decreaseLineItemQuantity(
                                                                    item.id,
                                                                )
                                                            }
                                                        >
                                                            -
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Diminuir quantidade
                                                    </TooltipContent>
                                                </Tooltip>
                                                <span className="w-6 text-center text-sm">
                                                    {item.quantity}
                                                </span>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() =>
                                                                increaseLineItemQuantity(
                                                                    item.id,
                                                                )
                                                            }
                                                        >
                                                            +
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Aumentar quantidade
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                removeLineItem(
                                                                    item.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Remover item
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
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
                                value={paymentMethod}
                                onValueChange={(value) => {
                                    if (
                                        value === 'money' ||
                                        value === 'pix' ||
                                        value === 'card' ||
                                        value === 'crediario'
                                    ) {
                                        setPaymentMethod(value);
                                    }
                                }}
                                className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                            >
                                {paymentMethodOptions.map((option) => (
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

                    {paymentMethod === 'card' ? (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">
                                    Detalhes do cartão
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardPaymentFields
                                    cardType={cardType}
                                    onCardTypeChange={setCardType}
                                    installments={installments}
                                    onInstallmentsChange={setInstallments}
                                    firstInstallmentDate={firstInstallmentDate}
                                    onFirstInstallmentDateChange={
                                        setFirstInstallmentDate
                                    }
                                    totalAmount={finalTotal}
                                    showCardTypeToggle
                                    enableInstallments={false}
                                />
                            </CardContent>
                        </Card>
                    ) : null}

                    {paymentMethod === 'crediario' ? (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">
                                    Crediario do cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="grid gap-2">
                                    <Label htmlFor="crediario-entry">
                                        Entrada no crediario
                                    </Label>
                                    <Input
                                        id="crediario-entry"
                                        type="text"
                                        inputMode="numeric"
                                        value={crediarioEntry}
                                        onChange={(event) => {
                                            setCrediarioEntry(
                                                formatCurrencyInput(
                                                    event.target.value,
                                                ),
                                            );
                                        }}
                                        placeholder="R$ 0,00"
                                    />
                                </div>
                                <CardPaymentFields
                                    cardType="credit"
                                    onCardTypeChange={setCardType}
                                    installments={installments}
                                    onInstallmentsChange={setInstallments}
                                    firstInstallmentDate={firstInstallmentDate}
                                    onFirstInstallmentDateChange={
                                        setFirstInstallmentDate
                                    }
                                    totalAmount={financedAmount}
                                    showCardTypeToggle={false}
                                    enableInstallments
                                    maxInstallments={maxCrediarioInstallments}
                                />
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        Saldo financiado
                                    </span>
                                    <span className="font-semibold">
                                        {formatCurrencyBR(financedAmount)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        Limite disponivel
                                    </span>
                                    <span className="font-semibold">
                                        {formatCurrencyBR(
                                            Math.max(
                                                0,
                                                Number(availableCredit ?? 0),
                                            ),
                                        )}
                                    </span>
                                </div>
                                {crediarioExceeded ? (
                                    <div className="space-y-2">
                                        <p className="text-sm text-destructive">
                                            O saldo financiado excede o limite
                                            disponivel do crediario.
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={onOpenEditClient}
                                        >
                                            Ajustar limite do cliente
                                        </Button>
                                    </div>
                                ) : isCrediarioEntryInvalid ? null : (
                                    <p className="text-sm text-muted-foreground">
                                        A venda sera registrada como pendente,
                                        com entrada imediata e parcelas no
                                        saldo financiado.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ) : null}

                    <div className="space-y-2 rounded-md border p-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Subtotal
                            </span>
                            <span>{formatCurrencyBR(total)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Desconto
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-green-600">
                                    - {formatCurrencyBR(discountAmountApplied)}
                                </span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={openDiscountDialog}
                                        >
                                            Aplicar
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Aplicar desconto
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-xl font-bold">Total</span>
                            <span className="text-2xl font-black text-primary">
                                {formatCurrencyBR(finalTotal)}
                            </span>
                        </div>
                    </div>

                    <Textarea
                        value={notes}
                        onChange={(event) =>
                            setNotes(event.currentTarget.value)
                        }
                        placeholder="Observacoes (opcional)"
                        rows={3}
                        className="h-24 resize-none"
                    />

                    <div
                        ref={calendarContainerRef}
                        className="relative space-y-2"
                    >
                        <Label>Data</Label>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => setCalendarOpen(!calendarOpen)}
                        >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {saleDate
                                ? format(
                                      parseLocalDate(saleDate),
                                      'dd/MM/yyyy',
                                      {
                                          locale: ptBR,
                                      },
                                  )
                                : 'Selecionar data'}
                        </Button>
                        {calendarOpen && (
                            <div className="absolute bottom-[calc(100%+0.25rem)] left-0 z-90 rounded-md border bg-background p-2 shadow-xl">
                                <Calendar
                                    mode="single"
                                    selected={
                                        saleDate
                                            ? parseLocalDate(saleDate)
                                            : undefined
                                    }
                                    onSelect={(date) => {
                                        if (date) {
                                            setSaleDate(
                                                format(date, 'yyyy-MM-dd'),
                                            );
                                        }

                                        setCalendarOpen(false);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <Button
                        type="button"
                        className="w-full"
                        size="lg"
                        disabled={
                            !canSubmit ||
                            crediarioExceeded ||
                            isCrediarioEntryInvalid
                        }
                        onClick={onSubmit}
                    >
                        Finalizar venda
                    </Button>
                </div>
            </div>
        </section>
    );
}
