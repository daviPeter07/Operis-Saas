import { DatePickerInput } from '@/components/date/date-picker-input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatCurrencyBR } from '@/lib/format';

type CardPaymentType = 'debit' | 'credit';

type CardPaymentFieldsProps = {
    cardType: CardPaymentType;
    onCardTypeChange: (value: CardPaymentType) => void;
    installments: string;
    onInstallmentsChange: (value: string) => void;
    firstInstallmentDate: string;
    onFirstInstallmentDateChange: (value: string) => void;
    totalAmount: number;
    showCardTypeToggle?: boolean;
    enableInstallments?: boolean;
};

const INSTALLMENT_OPTIONS = Array.from({ length: 24 }, (_, index) => {
    const value = String(index + 1);

    return {
        value,
        installments: index + 1,
    };
});

export function CardPaymentFields({
    cardType,
    onCardTypeChange,
    installments,
    onInstallmentsChange,
    firstInstallmentDate,
    onFirstInstallmentDateChange,
    totalAmount,
    showCardTypeToggle = true,
    enableInstallments = true,
}: CardPaymentFieldsProps) {
    const safeInstallments = Math.max(
        1,
        Math.min(24, Number(installments) || 1),
    );
    const installmentOptionsWithAmount = INSTALLMENT_OPTIONS.map((option) => {
        const valuePerInstallment = Number(
            (Math.max(0, totalAmount) / option.installments).toFixed(2),
        );

        return {
            value: option.value,
            label: `${option.installments}x (${formatCurrencyBR(valuePerInstallment)})`,
        };
    });

    return (
        <div className="grid gap-3 rounded-md border p-3">
            {showCardTypeToggle ? (
                <div className="grid gap-2">
                    <Label>Tipo no cartão</Label>
                    <ToggleGroup
                        type="single"
                        value={cardType}
                        onValueChange={(value) => {
                            if (value === 'debit' || value === 'credit') {
                                onCardTypeChange(value);
                            }
                        }}
                        className="grid grid-cols-2 gap-2"
                    >
                        <ToggleGroupItem
                            value="debit"
                            variant="outline"
                            className="rounded-md border"
                        >
                            Débito
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="credit"
                            variant="outline"
                            className="rounded-md border"
                        >
                            Crédito
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
            ) : null}

            {enableInstallments ? (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="card-installments">Parcelas</Label>
                        <Select
                            value={String(safeInstallments)}
                            onValueChange={onInstallmentsChange}
                        >
                            <SelectTrigger id="card-installments">
                                <SelectValue placeholder="Selecione as parcelas" />
                            </SelectTrigger>
                            <SelectContent>
                                {installmentOptionsWithAmount.map((option) => (
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
                        <Label>Data da primeira parcela</Label>
                        <DatePickerInput
                            value={firstInstallmentDate}
                            onChange={onFirstInstallmentDateChange}
                            placeholder="Selecionar data"
                        />
                    </div>
                </>
            ) : null}
        </div>
    );
}
