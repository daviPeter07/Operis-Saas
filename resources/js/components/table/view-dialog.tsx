import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface ViewField {
    label: string;
    value: string | number | React.ReactNode;
}

export interface ViewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    fields: ViewField[];
    className?: string;
}

export function ViewDialog({
    open,
    onOpenChange,
    title = 'Detalhes do Registro',
    fields,
    className,
}: ViewDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn('sm:max-w-[500px]', className)}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {fields.map((field, index) => (
                        <div key={index}>
                            <Label className="text-muted-foreground">
                                {field.label}
                            </Label>
                            <div className="mt-1 text-sm">
                                {typeof field.value === 'string' ||
                                typeof field.value === 'number' ? (
                                    <span>{field.value}</span>
                                ) : (
                                    field.value
                                )}
                            </div>
                            {index < fields.length - 1 && (
                                <Separator className="mt-4" />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Fechar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
