import { cn } from '@/lib/utils';
import type { OperisBrandProps } from '../../utils/types';
import { DgLogoMark } from '../dg-logo-mark';

/** Operis wordmark with the logo mark, used in the header and footer. */
export function OperisBrand({ className }: OperisBrandProps) {
    return (
        <span className={cn('inline-flex items-center gap-2.5', className)}>
            <DgLogoMark className="h-8" />
            <span className="font-display text-xl font-bold tracking-tight text-dg-ink">
                Operis
            </span>
        </span>
    );
}
