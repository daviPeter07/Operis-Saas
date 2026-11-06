import { Check } from 'lucide-react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import { PURCHASE_STEPS } from '../../utils/constants';
import type { PurchaseStepsProps } from '../../utils/types';

export function PurchaseSteps({
    current,
    reachable,
    onSelect,
}: PurchaseStepsProps) {
    return (
        <ol className="flex items-start">
            {PURCHASE_STEPS.map((step, index) => {
                const isDone = index < current;
                const isCurrent = index === current;
                const isAvailable = index <= reachable;

                return (
                    <Fragment key={step.key}>
                        {index > 0 ? (
                            <li
                                aria-hidden
                                className={cn(
                                    'mt-4 h-0.5 min-w-3 flex-1 rounded-full transition-colors',
                                    index <= current
                                        ? 'bg-accent'
                                        : 'bg-border',
                                )}
                            />
                        ) : null}
                        <li className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-center sm:w-32">
                            <button
                                type="button"
                                disabled={!isAvailable}
                                aria-current={isCurrent ? 'step' : undefined}
                                aria-label={`Etapa ${index + 1}: ${step.label}`}
                                onClick={() => onSelect(index)}
                                className={cn(
                                    'flex size-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed',
                                    isDone &&
                                        'cursor-pointer border-accent bg-accent text-accent-foreground',
                                    isCurrent &&
                                        'border-accent bg-accent/15 text-accent',
                                    !isDone &&
                                        !isCurrent &&
                                        'border-border text-muted-foreground',
                                    !isDone &&
                                        !isCurrent &&
                                        isAvailable &&
                                        'cursor-pointer hover:border-accent/60',
                                )}
                            >
                                {isDone ? (
                                    <Check aria-hidden className="size-4" />
                                ) : (
                                    index + 1
                                )}
                            </button>
                            <div>
                                <p
                                    className={cn(
                                        'text-[11px] leading-tight font-medium sm:text-sm',
                                        isCurrent || isDone
                                            ? 'text-foreground'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {step.label}
                                </p>
                                <p className="hidden text-xs text-muted-foreground sm:block">
                                    {step.description}
                                </p>
                            </div>
                        </li>
                    </Fragment>
                );
            })}
        </ol>
    );
}
