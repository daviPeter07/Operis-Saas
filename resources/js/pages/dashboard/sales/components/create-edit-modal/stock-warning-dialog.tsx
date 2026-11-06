import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { StockWarningDialogProps } from '../../utils/types';

export function StockWarningDialog({
    warning,
    isSubmitting,
    onCancel,
    onConfirm,
}: StockWarningDialogProps) {
    return (
        <Dialog
            open={warning !== null}
            onOpenChange={(open) => !open && onCancel()}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Estoque negativo</DialogTitle>
                    <DialogDescription>{warning?.message}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        disabled={isSubmitting}
                        onClick={onConfirm}
                    >
                        Ir pra venda mesmo assim
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
