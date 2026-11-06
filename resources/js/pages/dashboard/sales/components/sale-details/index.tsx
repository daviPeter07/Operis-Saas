import { DetailsField, DetailsSection } from '@/components/details-page';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import { toNumber } from '@/services/normalizers';
import { PAYMENT_METHOD_LABELS } from '../../utils/constants';
import { formatOptionalDateTime, getSaleProfit } from '../../utils/functions';
import type { SaleDetailsProps } from '../../utils/types';
import { SaleStatusChip } from '../sale-status-chip';

export function SaleDetails({ sale }: SaleDetailsProps) {
    const installments = sale.installments ?? 1;
    const entry = toNumber(sale.crediario_entry);
    const discount = toNumber(sale.discount);

    return (
        <div className="space-y-4">
            <DetailsSection title="Resumo">
                <DetailsField label="Cliente">
                    {sale.customer_name || 'Sem cliente'}
                </DetailsField>
                <DetailsField label="Data da venda">
                    {formatDateBR(sale.date)}
                </DetailsField>
                <DetailsField
                    label={
                        sale.status === 'cancelled'
                            ? 'Data do cancelamento'
                            : 'Data de conclusão'
                    }
                >
                    {formatOptionalDateTime(
                        sale.status === 'cancelled'
                            ? sale.cancelled_at
                            : sale.completed_at,
                    )}
                </DetailsField>
                <DetailsField label="Status">
                    <SaleStatusChip status={sale.status} />
                </DetailsField>
                <DetailsField label="M. pagamento">
                    {PAYMENT_METHOD_LABELS[sale.payment_method] ??
                        sale.payment_method}
                </DetailsField>
                <DetailsField label="Parcelas">
                    {installments > 1 && sale.installment_value
                        ? `${installments}x de ${formatCurrencyBR(sale.installment_value)}`
                        : `${installments}x`}
                </DetailsField>
                {entry > 0 ? (
                    <DetailsField label="Entrada">
                        {formatCurrencyBR(entry)}
                    </DetailsField>
                ) : null}
            </DetailsSection>

            <DetailsSection title="Valores">
                <DetailsField label="Subtotal">
                    {formatCurrencyBR(sale.subtotal)}
                </DetailsField>
                <DetailsField label="Desconto">
                    {discount > 0 ? `- ${formatCurrencyBR(discount)}` : '-'}
                </DetailsField>
                <DetailsField label="Total">
                    {formatCurrencyBR(sale.total)}
                </DetailsField>
                <DetailsField label="Lucro">
                    {formatCurrencyBR(getSaleProfit(sale))}
                </DetailsField>
            </DetailsSection>
        </div>
    );
}
