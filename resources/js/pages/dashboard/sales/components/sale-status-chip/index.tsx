import { cn } from '@/lib/utils';
import {
    SALE_STATUS_CHIP_CLASS,
    SALE_STATUS_LABELS,
} from '../../utils/constants';
import type { SaleStatusChipProps } from '../../utils/types';

export function SaleStatusChip({ status }: SaleStatusChipProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1',
                SALE_STATUS_CHIP_CLASS[status] ??
                    'bg-muted text-muted-foreground ring-border',
            )}
        >
            {SALE_STATUS_LABELS[status] ?? status}
        </span>
    );
}
