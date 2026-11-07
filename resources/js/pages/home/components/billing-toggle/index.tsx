import { cn } from '@/lib/utils';
import type { BillingToggleProps } from '../../utils/types';

export function BillingToggle({ plans, value, onChange }: BillingToggleProps) {
    return (
        <div
            role="radiogroup"
            aria-label="Forma de pagamento do plano"
            className="inline-flex rounded-xl border border-neutral-200 bg-neutral-100 p-1"
        >
            {plans.map((plan) => {
                const isActive = plan.period === value;

                return (
                    <button
                        key={plan.id}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => onChange(plan.period)}
                        className={cn(
                            'inline-flex h-9 items-center gap-2 rounded-[10px] px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-dg-orange/60',
                            isActive
                                ? 'bg-white text-dg-ink shadow-sm'
                                : 'text-neutral-500 hover:text-dg-ink',
                        )}
                    >
                        {plan.label}
                    </button>
                );
            })}
        </div>
    );
}
