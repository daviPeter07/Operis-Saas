import { cn } from '@/lib/utils';
import type { LandingButtonProps } from '../../utils/types';

/** Link styled as a button for the landing page (all landing CTAs navigate). */
export function LandingButton({
    variant = 'solid',
    className,
    ...props
}: LandingButtonProps) {
    return (
        <a
            className={cn(
                'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-dg-orange/60',
                variant === 'solid' &&
                    'bg-dg-ink text-white hover:bg-neutral-700',
                variant === 'outline' &&
                    'border border-neutral-300 bg-white text-dg-ink hover:border-neutral-400 hover:bg-neutral-50',
                className,
            )}
            {...props}
        />
    );
}
