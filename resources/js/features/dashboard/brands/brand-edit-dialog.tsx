import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { ENTITY_STATUS_OPTIONS } from '@/constants/entity-status';
import type { BrandRow } from '@/features/dashboard/brands/index';

type BrandEditDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    brand: BrandRow | null;
    onSubmit: (data: {
        name: string;
        status: 'active' | 'inactive';
    }) => Promise<void>;
};

export function BrandEditDialog({
    open,
    onOpenChange,
    brand,
    onSubmit,
}: BrandEditDialogProps) {
    const [name, setName] = React.useState('');
    const [status, setStatus] = React.useState('active');

    React.useEffect(() => {
        if (brand) {
            setName(brand.name);
            setStatus(brand.status);
        }
    }, [brand]);

    const handleSave = async () => {
        if (!brand) {
return;
}

        await onSubmit({
            name: name.trim(),
            status: status as 'active' | 'inactive',
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar marca</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Nome</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                {ENTITY_STATUS_OPTIONS.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleSave}>Salvar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
