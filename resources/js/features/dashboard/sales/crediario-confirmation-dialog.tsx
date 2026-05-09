import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';

interface CrediarioParcel {
    installment_number: number;
    amount: number;
    due_date: string;
    status: string;
    id: number;
}

interface CrediarioConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientName: string;
    totalAmount: number;
    parcels: CrediarioParcel[];
    onConfirm: (paidParcelIds: number[]) => Promise<void>;
    isPending: boolean;
}

export function CrediarioConfirmationDialog({
    open,
    onOpenChange,
    clientName,
    totalAmount,
    parcels,
    onConfirm,
    isPending,
}: CrediarioConfirmationDialogProps) {
    const [selectedParcels, setSelectedParcels] = useState<Set<number>>(
        new Set(),
    );

    const pendingParcels = parcels.filter((p) => p.status === 'pending');

    const handleToggle = (installmentNumber: number) => {
        const next = new Set(selectedParcels);
        if (next.has(installmentNumber)) {
            next.delete(installmentNumber);
        } else {
            next.add(installmentNumber);
        }
        setSelectedParcels(next);
    };

    const handleConfirm = async () => {
        const paidParcels = pendingParcels.filter((p) =>
            selectedParcels.has(p.installment_number),
        );
        await onConfirm(paidParcels.map((p) => p.id));
        onOpenChange(false);
        setSelectedParcels(new Set());
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirmar Parcelas - Crediário</DialogTitle>
                    <DialogDescription>
                        Cliente: {clientName} - Total:{' '}
                        {formatCurrencyBR(totalAmount)}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    {pendingParcels.map((parcel) => (
                        <div
                            key={parcel.installment_number}
                            className="flex items-center justify-between rounded-lg border p-3"
                        >
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id={`parcel-${parcel.installment_number}`}
                                    checked={selectedParcels.has(
                                        parcel.installment_number,
                                    )}
                                    onCheckedChange={() =>
                                        handleToggle(
                                            parcel.installment_number,
                                        )
                                    }
                                />
                                <div>
                                    <p className="font-medium">
                                        Parcela {parcel.installment_number}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Vencimento:{' '}
                                        {formatDateBR(parcel.due_date)}
                                    </p>
                                </div>
                            </div>
                            <span className="font-semibold">
                                {formatCurrencyBR(parcel.amount)}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                        {selectedParcels.size} parcela(s) selecionada(s)
                    </div>
                    <Button
                        onClick={handleConfirm}
                        disabled={selectedParcels.size === 0 || isPending}
                    >
                        {isPending ? 'Confirmando...' : 'Confirmar Pagamento'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}