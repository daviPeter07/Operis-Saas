import { useState } from 'react';
import { initialAccountsPayableForm } from '@/constants/dashboard-form-initials';
import { useFormState } from '@/hooks/use-form-state';
import type { AccountsPayableCreateDialogProps } from '@/types/dashboard-forms';
import { mapFinancialFormToAccountsPayable } from '@/utils/dashboard-financial';
import { FinancialEntryDialog } from '../shared/financial-entry-dialog';
import { SupplierCreateDialog } from '../suppliers/supplier-create-dialog';

export function AccountsPayableCreateDialog({
    open,
    onOpenChange,
    onSubmit,
    suppliers,
    onCreateSupplier,
}: AccountsPayableCreateDialogProps) {
    const { form, setField } = useFormState(initialAccountsPayableForm, open);
    const [supplierCreateOpen, setSupplierCreateOpen] = useState(false);

    return (
        <>
            <FinancialEntryDialog
                open={open}
                onOpenChange={onOpenChange}
                title="Nova conta a pagar"
                description="Use o mesmo fechamento operacional das compras para revisar fornecedor, valores e pagamento."
                primarySectionTitle="Fechamento da conta"
                submitLabel="Continuar"
                form={form}
                onChange={setField}
                suppliers={suppliers}
                onOpenCreateSupplier={() => setSupplierCreateOpen(true)}
                catalogSection={
                    <div className="space-y-3 rounded-xl border bg-muted/20 p-5">
                        <div>
                            <h3 className="text-sm font-semibold">
                                Fluxo compartilhado com compras
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Contas a pagar manuais continuam fora do escopo. O
                                fechamento abaixo existe para manter o mesmo padrao
                                visual antes de redirecionar para o cadastro de
                                compra.
                            </p>
                        </div>

                        <div className="rounded-lg border border-dashed bg-background p-4 text-sm text-muted-foreground">
                            Para gerar titulos reais no backend, finalize pelo
                            fluxo de compra completo.
                        </div>
                    </div>
                }
                onSubmit={() => {
                    onSubmit(mapFinancialFormToAccountsPayable(form));
                }}
            />

            <SupplierCreateDialog
                open={supplierCreateOpen}
                onOpenChange={setSupplierCreateOpen}
                onSuccess={({ id, name }) => {
                    void onCreateSupplier({
                        id: String(id),
                        name,
                        email: '',
                        phone: '',
                        document: '',
                        city: '',
                        state: '',
                        address: '',
                        createdAt: new Date().toISOString().slice(0, 10),
                    }).then((supplier) => {
                        setField('supplierName', supplier.name);
                    });
                }}
            />
        </>
    );
}
