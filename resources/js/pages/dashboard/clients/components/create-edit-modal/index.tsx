import { useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { CLIENT_DIALOG_TEXT } from '../../utils/constants';
import { toInitialData } from '../../utils/functions';
import type { CreateEditModalProps } from '../../utils/types';
import { ClientForm } from './client-form';

// Also used by the sales and receivables screens, which pass initialData and onSuccess.
export function CreateEditModal({
    open,
    onOpenChange,
    customer,
    initialData,
    onSuccess,
}: CreateEditModalProps) {
    const data = useMemo(
        () => initialData ?? (customer ? toInitialData(customer) : undefined),
        [customer, initialData],
    );
    const text = CLIENT_DIALOG_TEXT[data?.id ? 'edit' : 'create'];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[calc(100vw-2rem)] sm:!max-w-[920px]">
                <DialogHeader>
                    <DialogTitle>{text.title}</DialogTitle>
                    <DialogDescription>{text.description}</DialogDescription>
                </DialogHeader>

                <ClientForm
                    initialData={data}
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
