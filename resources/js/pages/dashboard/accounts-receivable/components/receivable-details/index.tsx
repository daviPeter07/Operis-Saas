import { DetailsField, DetailsSection } from '@/components/details-page';
import { RecordLink } from '@/components/table/record-link';
import { withAppBasePath } from '@/constants/workspace';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import { toNumber } from '@/services/normalizers';
import { PAYMENT_METHOD_LABELS, SETTLE_LABELS } from '../../utils/constants';
import { formatSettledAt, getInstallmentLabel } from '../../utils/functions';
import type { ReceivableDetailsProps } from '../../utils/types';
import { ReceivableStatusChip } from '../receivable-status-chip';

export function ReceivableDetails({ receivable }: ReceivableDetailsProps) {
    return (
        <div className="space-y-4">
            <DetailsSection title="Resumo">
                <DetailsField label="Cliente">
                    {receivable.customer_name || 'Sem cliente'}
                </DetailsField>
                <DetailsField label="Descrição">
                    {receivable.item || '-'}
                </DetailsField>
                <DetailsField label="Origem">
                    {receivable.sale_id ? (
                        <RecordLink
                            href={withAppBasePath(
                                `/dashboard/sales/${receivable.sale_id}`,
                            )}
                        >
                            Venda #{receivable.sale_id}
                        </RecordLink>
                    ) : (
                        'Manual'
                    )}
                </DetailsField>
                <DetailsField label="Parcela">
                    {getInstallmentLabel(receivable)}
                </DetailsField>
                <DetailsField label="Lançamento">
                    {receivable.entry_date
                        ? formatDateBR(receivable.entry_date)
                        : '-'}
                </DetailsField>
                <DetailsField label="Vencimento">
                    {receivable.due_date
                        ? formatDateBR(receivable.due_date)
                        : '-'}
                </DetailsField>
                <DetailsField label="Status">
                    <ReceivableStatusChip status={receivable.status} />
                </DetailsField>
                <DetailsField label={SETTLE_LABELS.settledOn}>
                    {formatSettledAt(receivable.received_at)}
                </DetailsField>
                <DetailsField label="Forma de pagamento">
                    {receivable.payment_method
                        ? (PAYMENT_METHOD_LABELS[receivable.payment_method] ??
                          receivable.payment_method)
                        : '-'}
                </DetailsField>
            </DetailsSection>

            <DetailsSection title="Valores">
                <DetailsField label="Valor">
                    {formatCurrencyBR(toNumber(receivable.total_amount))}
                </DetailsField>
                <DetailsField label={SETTLE_LABELS.settledAmount}>
                    {formatCurrencyBR(toNumber(receivable.amount_paid))}
                </DetailsField>
                <DetailsField label="Em aberto">
                    {formatCurrencyBR(toNumber(receivable.remaining_balance))}
                </DetailsField>
            </DetailsSection>

            <DetailsSection title="Observações">
                <DetailsField label="Anotações da conta" wide>
                    {receivable.description?.trim() ? (
                        <span className="whitespace-pre-line">
                            {receivable.description}
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
