import { DetailsField, DetailsSection } from '@/components/details-page';
import { PERSON_TYPE_LABELS } from '@/constants/person-type';
import { formatDateTimeManaus } from '@/lib/format';
import { formatDocumentDisplay, formatPhoneDisplay } from '@/utils/form-fields';
import { DOCUMENT_FIELD } from '../../utils/constants';
import type { SupplierDetailsProps } from '../../utils/types';
import { NotInformed } from './not-informed';

export function SupplierDetails({ supplier }: SupplierDetailsProps) {
    return (
        <div className="space-y-4">
            <DetailsSection title="Identificação">
                <DetailsField label="Nome">{supplier.name}</DetailsField>
                <DetailsField label="Tipo de pessoa">
                    {PERSON_TYPE_LABELS[supplier.person_type]}
                </DetailsField>
                <DetailsField
                    label={DOCUMENT_FIELD[supplier.person_type].label}
                >
                    {formatDocumentDisplay(supplier.document)}
                </DetailsField>
                <DetailsField label="Cadastrado em">
                    {supplier.createdAt
                        ? formatDateTimeManaus(supplier.createdAt)
                        : '-'}
                </DetailsField>
            </DetailsSection>

            <DetailsSection title="Contato">
                <DetailsField label="E-mail">
                    {supplier.email ? (
                        <a
                            href={`mailto:${supplier.email}`}
                            className="hover:underline"
                        >
                            {supplier.email}
                        </a>
                    ) : (
                        <NotInformed />
                    )}
                </DetailsField>
                <DetailsField label="Telefone">
                    {formatPhoneDisplay(supplier.phone)}
                </DetailsField>
            </DetailsSection>
        </div>
    );
}
