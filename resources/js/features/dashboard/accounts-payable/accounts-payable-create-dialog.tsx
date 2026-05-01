import { useFormState } from '@/hooks/use-form-state';
import { initialAccountsPayableForm } from '@/constants/dashboard-form-initials';
import type { AccountsPayableCreateDialogProps } from '@/types/dashboard-forms';
import { mapFinancialFormToAccountsPayable } from '@/utils/dashboard-financial';
import { FinancialEntryDialog } from '../shared/financial-entry-dialog';

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
                onSubmit(mapFinancialFormToAccountsPayable(form));
            }}
        />
    );
}
