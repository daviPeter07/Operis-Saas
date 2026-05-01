import { useFormState } from '@/hooks/use-form-state';
import type { Purchase } from '@/lib/mocks/mock-data';
import { FinancialEntryDialog } from '../shared/financial-entry-dialog';
import { initialAccountsPayableForm } from './accounts-payable-create-dialog.constants';
import type { AccountsPayableCreateDialogProps } from './accounts-payable-create-dialog.types';

export function AccountsPayableCreateDialog({
    open,
    onOpenChange,
    onSubmit,
}: AccountsPayableCreateDialogProps) {
    const { form, setField } = useFormState(initialAccountsPayableForm, open);

    return (
        <FinancialEntryDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Criar Nova Conta a Pagar"
            description="Preencha os dados da conta com campos guiados."
            primarySectionTitle="Dados da conta"
            submitLabel="Criar"
            form={form}
            onChange={setField}
            onSubmit={() => {
                onSubmit({
                    id: '',
                    supplierId: '',
                    supplierName: form.supplierName,
                    total: Number(form.total || 0),
                    status: form.status as Purchase['status'],
                    paymentMethod: form.paymentMethod as Purchase['paymentMethod'],
                    items: Number(form.items || 1),
                    dueDate: form.createdAt,
                    createdAt: form.createdAt,
                });
            }}
        />
    );
}
