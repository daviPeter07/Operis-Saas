import { cn } from '@/lib/utils';
import {
    RECEIVABLE_STATUS_CHIP_CLASS,
    RECEIVABLE_STATUS_LABELS,
} from '../../utils/constants';
import type { ReceivableStatusChipProps } from '../../utils/types';

export function ReceivableStatusChip({ status }: ReceivableStatusChipProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1',
                RECEIVABLE_STATUS_CHIP_CLASS[status] ??
                    'bg-muted text-muted-foreground ring-border',
            )}
        >
            {RECEIVABLE_STATUS_LABELS[status] ?? status}
        </span>
    );
}
