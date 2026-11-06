import { cn } from '@/lib/utils';
import {
    PAYABLE_STATUS_CHIP_CLASS,
    PAYABLE_STATUS_LABELS,
} from '../../utils/constants';
import type { PayableStatusChipProps } from '../../utils/types';

export function PayableStatusChip({ status }: PayableStatusChipProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1',
                PAYABLE_STATUS_CHIP_CLASS[status] ??
                    'bg-muted text-muted-foreground ring-border',
            )}
        >
            {PAYABLE_STATUS_LABELS[status] ?? status}
        </span>
    );
}
