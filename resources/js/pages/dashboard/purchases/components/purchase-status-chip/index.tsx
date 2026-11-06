import { cn } from '@/lib/utils';
import {
    PURCHASE_STATUS_CHIP_CLASS,
    PURCHASE_STATUS_LABELS,
} from '../../utils/constants';
import type { PurchaseStatusChipProps } from '../../utils/types';

export function PurchaseStatusChip({ status }: PurchaseStatusChipProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1',
                PURCHASE_STATUS_CHIP_CLASS[status] ??
                    'bg-muted text-muted-foreground ring-border',
            )}
        >
            {PURCHASE_STATUS_LABELS[status] ?? status}
        </span>
    );
}
