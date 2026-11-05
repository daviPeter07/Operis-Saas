import { Check } from 'lucide-react';
import { formatCurrency, landingLinks, promotionalPlan } from '../constants';
import { LandingButton } from './landing-button';
import { SectionHeading } from './section-heading';

const formatWholeCurrency = (value: number): string =>
    formatCurrency(value).replace(',00', '');

/** Single pricing card, based on the middle card of Magic UI Pro "pricing-3". */
export function PricingSection() {
    return (
        <section
            id="preco"
            className="scroll-mt-16 border-t border-neutral-200 bg-white py-20 sm:py-28"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <SectionHeading
                    title="Um plano, o sistema inteiro"
                    description="Sem módulo cobrado à parte e sem limite de vendas. Você paga uma vez por ano e usa tudo o que o Operis oferece."
                />

                <article
                    aria-labelledby="plano-anual"
                    className="relative mx-auto mt-12 flex max-w-sm flex-col overflow-hidden rounded-[14px] border border-neutral-200 bg-white p-6"
                >
                    <p className="absolute top-5 -right-11 w-40 rotate-45 bg-dg-orange py-1 text-center text-xs font-bold text-dg-ink">
                        Promocional
                    </p>

                    <h3
                        id="plano-anual"
                        className="text-lg font-semibold text-dg-ink"
                    >
                        Plano anual
                    </h3>
                    <p className="mt-1.5 pr-10 text-sm leading-relaxed text-neutral-500">
                        Para a empresa que quer vender, controlar o estoque e
                        receber em dia.
                    </p>

                    <p className="mt-6 flex items-baseline gap-1.5 text-dg-ink">
                        <span className="text-[2rem] leading-none font-bold tracking-tight">
                            {formatWholeCurrency(promotionalPlan.yearlyPrice)}
                        </span>
                        <span className="text-sm text-neutral-500">/ ano</span>
                    </p>
                    <p className="mt-2 text-xs text-neutral-500">
                        Equivale a{' '}
                        {formatWholeCurrency(promotionalPlan.monthlyEquivalent)}{' '}
                        por mês.
                    </p>

                    <LandingButton
                        href={landingLinks.register}
                        className="mt-5 h-9 w-full rounded-[10px]"
                    >
                        Criar minha conta
                    </LandingButton>

                    <p className="mt-6 text-sm text-neutral-500">
                        Tudo incluído no plano:
                    </p>
                    <ul className="mt-3 space-y-2.5 text-sm text-neutral-700">
                        {promotionalPlan.benefits.map((benefit) => (
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
            </div>
        </section>
    );
}
