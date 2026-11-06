import { DetailsField, DetailsSection } from '@/components/details-page';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import { toNumber } from '@/services/normalizers';
import { getPaymentLabel, isOpenPayableStatus } from '../../utils/functions';
import type { PurchaseDetailsProps } from '../../utils/types';
import { PurchaseStatusChip } from '../purchase-status-chip';

export function PurchaseDetails({ purchase }: PurchaseDetailsProps) {
    const payables = purchase.payables ?? [];
    const paid = payables
        .filter((payable) => payable.status !== 'cancelled')
        .reduce((sum, payable) => sum + toNumber(payable.amount_paid), 0);
    const open = payables
        .filter((payable) => isOpenPayableStatus(payable.status))
        .reduce(
            (sum, payable) =>
                sum + toNumber(payable.amount) - toNumber(payable.amount_paid),
            0,
        );

    return (
        <div className="space-y-4">
            <DetailsSection title="Resumo">
                <DetailsField label="Fornecedor">
                    {purchase.supplier_name || 'Sem fornecedor'}
                </DetailsField>
                <DetailsField label="Data da compra">
                    {formatDateBR(purchase.date)}
                </DetailsField>
                <DetailsField label="Vencimento">
                    {purchase.due_date ? formatDateBR(purchase.due_date) : '-'}
                </DetailsField>
                <DetailsField label="Status">
                    <PurchaseStatusChip status={purchase.status} />
                </DetailsField>
                <DetailsField label="M. pagamento">
                    {getPaymentLabel(
                        purchase.payment_method,
                        purchase.boleto_term_days,
                    )}
                </DetailsField>
            </DetailsSection>

            <DetailsSection title="Valores">
                <DetailsField label="Total">
                    {formatCurrencyBR(purchase.total)}
                </DetailsField>
                <DetailsField label="Pago">
                    {formatCurrencyBR(paid)}
                </DetailsField>
                <DetailsField label="Em aberto">
                    {formatCurrencyBR(open)}
                </DetailsField>
            </DetailsSection>

            <DetailsSection title="Observações">
                <DetailsField label="Anotações da compra" wide>
                    {purchase.notes?.trim() ? (
                        <span className="whitespace-pre-line">
                            {purchase.notes}
                        </span>
                    ) : (
                        <span className="font-normal text-muted-foreground">
                            Nenhuma observação nesta compra.
                        </span>
                    )}
                </DetailsField>
            </DetailsSection>
        </div>
    );
}
