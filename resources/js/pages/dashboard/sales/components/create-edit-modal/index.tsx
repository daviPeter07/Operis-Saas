import { useState } from 'react';
import { toast } from 'sonner';
import { keepDialogOpenWhileSearchListOpen } from '@/components/input-search-complete';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAccountReceivables } from '@/hooks/use-account-receivables';
import { useCustomers } from '@/hooks/use-customers';
import { useProducts } from '@/hooks/use-products';
import type { SaleMutationInput } from '@/hooks/use-sales';
import { useCreateSale, useUpdateSale } from '@/hooks/use-sales';
import {
    SALE_DIALOG_TEXT,
    STOCK_WARNING_FALLBACK,
} from '../../utils/constants';
import {
    getErrorMessage,
    getInstallmentAmounts,
    getOwnOpenBalance,
    getPaidInstallments,
    getSaleReceivables,
    isStockError,
    toSaleFormInitial,
    toSaleMutationInput,
    toUiCustomer,
    toUiProduct,
} from '../../utils/functions';
import type {
    CreateEditModalProps,
    SaleDraft,
    StockWarning,
} from '../../utils/types';
import { SaleForm } from './sale-form';
import { StockWarningDialog } from './stock-warning-dialog';

export function CreateEditModal({
    open,
    onOpenChange,
    sale,
}: CreateEditModalProps) {
    const { data: customers = [] } = useCustomers();
    const { data: products = [] } = useProducts();
    const { data: receivables = [] } = useAccountReceivables();
    const createSale = useCreateSale();
    const updateSale = useUpdateSale();
    const [stockWarning, setStockWarning] = useState<StockWarning | null>(null);

    const text = SALE_DIALOG_TEXT[sale ? 'edit' : 'create'];
    const saleReceivables = sale
        ? getSaleReceivables(receivables, sale.id)
        : [];
    const ownOpenBalance = getOwnOpenBalance(saleReceivables);
    const clients = customers.map((customer) =>
        toUiCustomer(
            customer,
            customer.id === sale?.customer_id ? ownOpenBalance : 0,
        ),
    );
    const isSubmitting = createSale.isPending || updateSale.isPending;

    const save = async (payload: SaleMutationInput) => {
        if (sale) {
            await updateSale.mutateAsync({ id: sale.id, data: payload });
        } else {
            await createSale.mutateAsync(payload);
        }

        toast.success(text.success);
        setStockWarning(null);
        onOpenChange(false);
    };

    const submit = async (draft: SaleDraft) => {
        const payload = toSaleMutationInput(draft);

        try {
            await save(payload);
        } catch (error) {
            if (isStockError(error)) {
                setStockWarning({
                    message: getErrorMessage(error, STOCK_WARNING_FALLBACK),
                    payload,
                });

                return;
            }

            toast.error(getErrorMessage(error, text.error));
        }
    };

    const saveWithNegativeStock = async () => {
        if (!stockWarning) {
            return;
        }

        try {
            await save({ ...stockWarning.payload, allow_negative_stock: true });
        } catch (error) {
            toast.error(getErrorMessage(error, text.error));
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className="max-w-[min(1700px,calc(100vw-1rem))] overflow-y-auto p-0 sm:max-w-[min(1700px,calc(100vw-1rem))]"
                    onEscapeKeyDown={keepDialogOpenWhileSearchListOpen}
                >
                    <SaleForm
                        title={sale ? `${text.title} #${sale.id}` : text.title}
                        description={text.description}
                        initial={toSaleFormInitial(sale)}
                        saleId={sale?.id}
                        saleStatus={sale?.status}
                        customers={customers}
                        clients={clients}
                        products={products.map(toUiProduct)}
                        paidInstallments={getPaidInstallments(saleReceivables)}
                        savedInstallmentAmounts={getInstallmentAmounts(
                            saleReceivables,
                        )}
                        isSubmitting={isSubmitting}
                        onSubmit={(draft) => void submit(draft)}
                    />
                </DialogContent>
            </Dialog>

            <StockWarningDialog
                warning={stockWarning}
                isSubmitting={isSubmitting}
                onCancel={() => setStockWarning(null)}
                onConfirm={() => void saveWithNegativeStock()}
            />
        </>
    );
}
