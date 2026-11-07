import { Check } from 'lucide-react';
import { formatWholeCurrency, getPlanWhatsAppUrl } from '../../utils/functions';
import type { PlanCardProps } from '../../utils/types';
import { LandingButton } from '../landing-button';

/** Pricing card, based on the middle card of Magic UI Pro "pricing-3". */
export function PlanCard({ plan, benefits }: PlanCardProps) {
    return (
        <article
            aria-labelledby={plan.id}
            className="relative flex flex-col overflow-hidden rounded-[14px] border border-neutral-200 bg-white p-6"
        >
            {plan.badge ? (
                <p className="absolute top-5 -right-11 w-40 rotate-45 bg-dg-orange py-1 text-center text-xs font-bold text-dg-ink">
                    {plan.badge}
                </p>
            ) : null}

            <h3 id={plan.id} className="text-lg font-semibold text-dg-ink">
                {plan.name}
            </h3>
            <p className="mt-1.5 pr-10 text-sm leading-relaxed text-neutral-500">
                {plan.description}
            </p>

            <div className="mt-6 min-h-[3.75rem]">
                {plan.originalPrice ? (
                    <p className="text-sm text-neutral-400">
                        <span className="sr-only">De </span>
                        <s>{formatWholeCurrency(plan.originalPrice)}</s>
                        <span className="sr-only"> por</span>
                    </p>
                ) : null}
                {plan.price === null ? (
                    <p className="text-[2rem] leading-none font-bold tracking-tight text-dg-ink">
                        Valor em breve
                    </p>
                ) : (
                    <p className="flex items-baseline gap-1.5 text-dg-ink">
                        <span className="text-[2rem] leading-none font-bold tracking-tight">
                            {formatWholeCurrency(plan.price)}
                        </span>
                        <span className="text-sm text-neutral-500">
                            / {plan.period}
                        </span>
                    </p>
                )}
            </div>

            <LandingButton
                href={getPlanWhatsAppUrl(plan)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 h-9 w-full rounded-[10px]"
            >
                Quero este plano
            </LandingButton>

            <p className="mt-6 text-sm text-neutral-500">
                Tudo incluído no plano:
            </p>
            <ul className="mt-3 space-y-2.5 text-sm text-neutral-700">
                {benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-2.5">
                        <Check
                            aria-hidden
                            className="mt-0.5 size-4 shrink-0 text-dg-ink"
                        />
                        {benefit}
                    </li>
                ))}
            </ul>
        </article>
    );
}
