import { useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { ClientCreateDialogProps } from '@/types/dashboard-forms';
import { CLIENT_DIALOG_TEXT } from '../../utils/constants';
import { toInitialData } from '../../utils/functions';
import type { CreateEditModalProps } from '../../utils/types';
import { ClientForm } from './client-form';

// Also used by the sales and receivables screens to create a client or edit its store credit.
export function ClientCreateDialog({
    open,
    onOpenChange,
    onSuccess,
    initialData,
}: ClientCreateDialogProps) {
    const text = CLIENT_DIALOG_TEXT[initialData?.id ? 'edit' : 'create'];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[calc(100vw-2rem)] sm:!max-w-[920px]">
                <DialogHeader>
                    <DialogTitle>{text.title}</DialogTitle>
                    <DialogDescription>{text.description}</DialogDescription>
                </DialogHeader>

                <ClientForm
                    initialData={initialData}
                    text={text}
                    onCancel={() => onOpenChange(false)}
                    onSaved={(client) => {
                        onOpenChange(false);
                        onSuccess?.(client);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}

export function CreateEditModal({
    open,
    onOpenChange,
    customer,
}: CreateEditModalProps) {
    const initialData = useMemo(
        () => (customer ? toInitialData(customer) : undefined),
        [customer],
    );

    return (
        <ClientCreateDialog
            open={open}
            onOpenChange={onOpenChange}
            initialData={initialData}
        />
    );
}
