import { DetailsField, DetailsSection } from '@/components/details-page';
import { RecordLink } from '@/components/table/record-link';
import { withAppBasePath } from '@/constants/workspace';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import { toNumber } from '@/services/normalizers';
import { PAID_METHOD_LABELS, SETTLE_LABELS } from '../../utils/constants';
import { formatSettledAt, getInstallmentLabel } from '../../utils/functions';
import type { PayableDetailsProps } from '../../utils/types';
import { PayableStatusChip } from '../payable-status-chip';

export function PayableDetails({ payable }: PayableDetailsProps) {
    return (
        <div className="space-y-4">
            <DetailsSection title="Resumo">
                <DetailsField label="Fornecedor">
                    {payable.supplier_name || 'Sem fornecedor'}
                </DetailsField>
                <DetailsField label="Descrição">
                    {payable.item || '-'}
                </DetailsField>
                <DetailsField label="Origem">
                    {payable.purchase_id ? (
                        <RecordLink
                            href={withAppBasePath(
                                `/dashboard/purchases/${payable.purchase_id}`,
                            )}
                        >
                            Compra #{payable.purchase_id}
                        </RecordLink>
                    ) : (
                        'Manual'
                    )}
                </DetailsField>
                <DetailsField label="Parcela">
                    {getInstallmentLabel(payable)}
                </DetailsField>
                <DetailsField label="Lançamento">
                    {payable.entry_date
                        ? formatDateBR(payable.entry_date)
                        : '-'}
                </DetailsField>
                <DetailsField label="Vencimento">
                    {payable.due_date ? formatDateBR(payable.due_date) : '-'}
                </DetailsField>
                <DetailsField label="Status">
                    <PayableStatusChip status={payable.status} />
                </DetailsField>
                <DetailsField label={SETTLE_LABELS.settledOn}>
                    {formatSettledAt(payable.paid_at)}
                </DetailsField>
                <DetailsField label="Forma de pagamento">
                    {payable.paid_method
                        ? (PAID_METHOD_LABELS[payable.paid_method] ??
                          payable.paid_method)
                        : '-'}
                </DetailsField>
            </DetailsSection>

            <DetailsSection title="Valores">
                <DetailsField label="Valor">
                    {formatCurrencyBR(toNumber(payable.total_amount))}
                </DetailsField>
                <DetailsField label={SETTLE_LABELS.settledAmount}>
                    {formatCurrencyBR(toNumber(payable.amount_paid))}
                </DetailsField>
                <DetailsField label="Em aberto">
                    {formatCurrencyBR(toNumber(payable.remaining_balance))}
                </DetailsField>
            </DetailsSection>

            <DetailsSection title="Observações">
                {payable.payment_notes?.trim() ? (
                    <DetailsField label="Observação do pagamento" wide>
                        <span className="whitespace-pre-line">
                            {payable.payment_notes}
                        </span>
                    </DetailsField>
                ) : null}
                <DetailsField label="Anotações da conta" wide>
                    {payable.description?.trim() ? (
                        <span className="whitespace-pre-line">
                            {payable.description}
                        </span>
                    ) : (
                        <span className="font-normal text-muted-foreground">
                            Nenhuma observação nesta conta.
                        </span>
                    )}
                </DetailsField>
            </DetailsSection>
        </div>
    );
}
