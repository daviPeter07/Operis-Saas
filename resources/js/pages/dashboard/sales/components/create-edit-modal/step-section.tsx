import { cn } from '@/lib/utils';
import type { StepSectionProps } from '../../utils/types';

export function StepSection({
    icon: Icon,
    title,
    description,
    action,
    className,
    children,
}: StepSectionProps) {
    return (
        <section className={cn('px-5 py-4', className)}>
            <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Icon aria-hidden className="size-4" />
                    </span>
                    <div>
                        <h3 className="leading-tight font-semibold">{title}</h3>
                        {description ? (
                            <p className="text-xs text-muted-foreground">
                                {description}
                            </p>
                        ) : null}
                    </div>
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}
