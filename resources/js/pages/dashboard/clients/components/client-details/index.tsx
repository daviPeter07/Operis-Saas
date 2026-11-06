import { DetailsField, DetailsSection } from '@/components/details-page';
import { PERSON_TYPE_LABELS } from '@/constants/person-type';
import { formatCurrencyBR, formatDateTimeManaus } from '@/lib/format';
import { inferPersonType } from '@/utils/clients';
import {
    formatClientDocument,
    formatClientPhone,
    getClientCredit,
} from '../../utils/functions';
import type { ClientDetailsProps } from '../../utils/types';

export function ClientDetails({ customer }: ClientDetailsProps) {
    const personType = inferPersonType(customer.document);
    const credit = getClientCredit(customer);

    return (
        <div className="space-y-4">
            <DetailsSection title="Identificação">
                <DetailsField label="Tipo de pessoa">
                    {PERSON_TYPE_LABELS[personType]}
                </DetailsField>
                <DetailsField label={personType === 'pj' ? 'CNPJ' : 'CPF'}>
                    {formatClientDocument(customer.document)}
                </DetailsField>
                <DetailsField label="Cadastrado em">
                    {customer.createdAt
                        ? formatDateTimeManaus(customer.createdAt)
                        : '-'}
                </DetailsField>
            </DetailsSection>

            <DetailsSection title="Contato">
                <DetailsField label="E-mail">
                    {customer.email || '-'}
                </DetailsField>
                <DetailsField label="Telefone">
                    {formatClientPhone(customer.phone)}
                </DetailsField>
            </DetailsSection>

            <DetailsSection title="Crediário">
                <DetailsField label="Situação">
                    {customer.credit_enabled ? 'Habilitado' : 'Desabilitado'}
                </DetailsField>
                <DetailsField label="Limite">
                    {formatCurrencyBR(credit.limit)}
                </DetailsField>
                <DetailsField label="Prazo">
                    {customer.credit_term_days
                        ? `${customer.credit_term_days} dias`
                        : '-'}
                </DetailsField>
                <DetailsField label="Em aberto">
                    {formatCurrencyBR(credit.openBalance)}
                </DetailsField>
                <DetailsField label="Crédito disponível">
                    {customer.credit_enabled
                        ? formatCurrencyBR(credit.available)
                        : '-'}
                </DetailsField>
            </DetailsSection>
        </div>
    );
}
