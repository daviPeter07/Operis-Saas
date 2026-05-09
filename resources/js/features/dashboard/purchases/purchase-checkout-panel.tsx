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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatCurrencyBR } from '@/lib/format';
import type { UiSupplier } from '@/types/dashboard-entities';
import type { SalesLineItem } from '@/types/sales-dialog';

function parseLocalDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);

    return new Date(year, (month || 1) - 1, day || 1);
}

interface PurchaseCheckoutPanelProps {
    supplierSearch: string;
    setSupplierSearch: (value: string) => void;
    filteredSuppliers: UiSupplier[];
    selectedSupplier: UiSupplier | null;
    selectSupplierById: (id: string) => void;
    openCreateSupplier: () => void;
    lineItems: SalesLineItem[];
    increaseLineItemQuantity: (id: string) => void;
    decreaseLineItemQuantity: (id: string) => void;
    removeLineItem: (id: string) => void;
    paymentMethod: 'money' | 'pix' | 'card' | 'boleto';
    setPaymentMethod: (value: 'money' | 'pix' | 'card' | 'boleto') => void;
    cardType: 'debit' | 'credit';
    setCardType: (value: 'debit' | 'credit') => void;
    total: number;
    notes: string;
    setNotes: (value: string) => void;
    purchaseDate: string;
    calendarOpen: boolean;
    setCalendarOpen: (open: boolean) => void;
    setPurchaseDate: (value: string) => void;
    canSubmit: boolean;
    onSubmit: () => void;
}

export function PurchaseCheckoutPanel({
    supplierSearch,
    setSupplierSearch,
    filteredSuppliers,
    selectedSupplier,
    selectSupplierById,
    openCreateSupplier,
    lineItems,
    increaseLineItemQuantity,
    decreaseLineItemQuantity,
    removeLineItem,
    paymentMethod,
    setPaymentMethod,
    cardType,
    setCardType,
    total,
    notes,
    setNotes,
    purchaseDate,
    calendarOpen,
    setCalendarOpen,
    setPurchaseDate,
    canSubmit,
    onSubmit,
}: PurchaseCheckoutPanelProps) {
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

    return (
        <section className="flex min-h-0 flex-col bg-card">
            <div className="border-b p-4">
                <DialogHeader className="text-left">
                    <DialogTitle className="text-lg">Finalizar compra</DialogTitle>
                    <DialogDescription>
                        Fornecedor, itens, pagamento e fechamento.
                    </DialogDescription>
                </DialogHeader>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">Fornecedor</CardTitle>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={openCreateSupplier}
                                >
                                    <UserPlus className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <SearchableSelect
                                value={selectedSupplier?.id || ''}
                                searchValue={supplierSearch}
                                onSearchChange={(value) => {
                                    if (
                                        selectedSupplier &&
                                        value !== selectedSupplier.name
                                    ) {
                                        selectSupplierById('');
                                    }
                                    setSupplierSearch(value);
                                }}
                                onChange={(value) => selectSupplierById(value)}
                                options={filteredSuppliers.map((supplier) => ({
                                    value: supplier.id,
                                    label: supplier.name,
                                }))}
                                placeholder="Buscar fornecedor"
                                emptyMessage="Nenhum fornecedor encontrado."
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
                                    <div key={item.id} className="rounded-md border p-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">{item.productName}</p>
                                                <p className="text-xs text-muted-foreground">{formatCurrencyBR(item.unitPrice)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button type="button" variant="outline" size="icon" onClick={() => decreaseLineItemQuantity(item.id)}>-</Button>
                                                <span className="w-6 text-center text-sm">{item.quantity}</span>
                                                <Button type="button" variant="outline" size="icon" onClick={() => increaseLineItemQuantity(item.id)}>+</Button>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeLineItem(item.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Forma de pagamento</CardTitle>
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
                                        value === 'boleto'
                                    ) {
                                        setPaymentMethod(value);
                                    }
                                }}
                                className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                            >
                                <ToggleGroupItem value="money" variant="outline" className="rounded-md border">Dinheiro</ToggleGroupItem>
                                <ToggleGroupItem value="pix" variant="outline" className="rounded-md border">PIX</ToggleGroupItem>
                                <ToggleGroupItem value="card" variant="outline" className="rounded-md border">Cartão</ToggleGroupItem>
                                <ToggleGroupItem value="boleto" variant="outline" className="rounded-md border">Boleto</ToggleGroupItem>
                            </ToggleGroup>
                        </CardContent>
                    </Card>

                    {paymentMethod === 'card' ? (
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm">Detalhes do cartão</CardTitle></CardHeader>
                            <CardContent>
                                <CardPaymentFields
                                    cardType={cardType}
                                    onCardTypeChange={setCardType}
                                    installments="1"
                                    onInstallmentsChange={() => {}}
                                    firstInstallmentDate={purchaseDate}
                                    onFirstInstallmentDateChange={() => {}}
                                    totalAmount={total}
                                    showCardTypeToggle
                                    enableInstallments={false}
                                />
                            </CardContent>
                        </Card>
                    ) : null}

                    <div className="space-y-2 rounded-md border p-3">
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-xl font-bold">Total</span>
                            <span className="text-2xl font-black text-primary">{formatCurrencyBR(total)}</span>
                        </div>
                    </div>

                    <Textarea
                        value={notes}
                        onChange={(event) => setNotes(event.currentTarget.value)}
                        placeholder="Observacoes (opcional)"
                        rows={3}
                        className="h-24 resize-none"
                    />

                    <div ref={calendarContainerRef} className="relative space-y-2">
                        <Label>Data</Label>
                        <Button type="button" variant="outline" className="w-full justify-start" onClick={() => setCalendarOpen(!calendarOpen)}>
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {purchaseDate ? format(parseLocalDate(purchaseDate), 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
                        </Button>
                        {calendarOpen && (
                            <div className="absolute bottom-[calc(100%+0.25rem)] left-0 z-90 rounded-md border bg-background p-2 shadow-xl">
                                <Calendar
                                    mode="single"
                                    selected={purchaseDate ? parseLocalDate(purchaseDate) : undefined}
                                    onSelect={(date) => {
                                        if (date) {
                                            setPurchaseDate(format(date, 'yyyy-MM-dd'));
                                        }
                                        setCalendarOpen(false);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <Button type="button" className="w-full" size="lg" disabled={!canSubmit} onClick={onSubmit}>
                        Finalizar compra
                    </Button>
                </div>
            </div>
        </section>
    );
}
