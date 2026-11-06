import { cn } from '@/lib/utils';
import type { DgLogoMarkProps } from '../../utils/types';

/** The DG Computer "g" mark; the bowl follows `currentColor`, the tick stays brand orange. */
export function DgLogoMark({ className }: DgLogoMarkProps) {
    return (
        <svg
            viewBox="28 0 68 116"
            fill="none"
            aria-hidden="true"
            className={cn('h-8 w-auto', className)}
        >
            <rect
                x="76.5"
                y="4"
                width="11"
                height="29"
                rx="5.5"
                className="fill-dg-orange"
            />
            <circle
                cx="62"
                cy="58"
                r="22.5"
                stroke="currentColor"
                strokeWidth="11"
            />
            <path
                d="M39.99 90.68 A22.5 22.5 0 0 0 84.01 90.68"
                stroke="currentColor"
                strokeWidth="11"
                strokeLinecap="round"
            />
        </svg>
    );
}
