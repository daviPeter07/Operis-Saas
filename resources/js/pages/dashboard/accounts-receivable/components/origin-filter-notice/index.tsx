import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OriginFilterNoticeProps } from '../../utils/types';

// Shown when the table was opened from a venda to list only its accounts.
export function OriginFilterNotice({
    originId,
    onClear,
}: OriginFilterNoticeProps) {
    return (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm">
            <p>
                Mostrando só as contas da{' '}
                <span className="font-semibold">Venda #{originId}</span>
            </p>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={onClear}
            >
                <X className="size-4" />
                Ver todas
            </Button>
        </div>
    );
}
