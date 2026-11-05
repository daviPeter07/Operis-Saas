import { Check } from 'lucide-react';
import { formatCurrency, landingLinks, promotionalPlan } from '../constants';
import { LandingButton } from './landing-button';

export function PricingSection() {
    return (
        <section id="preco" className="scroll-mt-16 bg-white py-20 sm:py-28">
            <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                <div className="lg:sticky lg:top-28">
                    <h2 className="font-display text-3xl leading-tight font-bold tracking-[-0.03em] text-dg-ink sm:text-[2.6rem]">
                        Um plano, o sistema inteiro
                    </h2>
                    <p className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-neutral-600">
                        Sem módulo cobrado à parte e sem limite de vendas. Você
                        paga uma vez por ano e usa tudo o que o Operis oferece.
                    </p>
                </div>

                <article
                    aria-labelledby="plano-anual"
                    className="relative overflow-hidden rounded-[1.75rem] border-2 border-dg-ink bg-white p-7 sm:p-10"
                >
                    <p
                        aria-label="Oferta promocional"
                        className="absolute top-7 -right-12 w-48 rotate-45 bg-dg-orange py-1.5 text-center text-sm font-bold text-dg-ink shadow-sm"
                    >
                        Promocional
                    </p>

                    <h3
                        id="plano-anual"
                        className="font-display text-xl font-bold text-dg-ink"
                    >
                        Plano anual
                    </h3>
                    <p className="mt-1 text-neutral-600">
                        Para a loja que quer vender, controlar o estoque e
                        receber em dia.
                    </p>

                    <p className="mt-8 flex items-baseline gap-2 text-dg-ink">
                        <span className="font-display text-6xl font-extrabold tracking-[-0.04em]">
                            {formatCurrency(
                                promotionalPlan.yearlyPrice,
                            ).replace(',00', '')}
                        </span>
                        <span className="text-lg text-neutral-600">/ano</span>
                    </p>
                    <p className="mt-2 text-sm text-neutral-500">
                        Equivale a{' '}
                        {formatCurrency(
                            promotionalPlan.monthlyEquivalent,
                        ).replace(',00', '')}{' '}
                        por mês.
                    </p>

                    <LandingButton
                        href={landingLinks.register}
                        className="mt-8 w-full sm:w-auto"
                    >
                        Criar minha conta
                    </LandingButton>

                    <h4 className="mt-10 font-semibold text-dg-ink">
                        O que você ganha
                    </h4>
                    <ul className="mt-4 grid gap-3 text-[0.95rem] text-neutral-700 sm:grid-cols-2 sm:gap-x-6">
                        {promotionalPlan.benefits.map((benefit) => (
                            <li key={benefit} className="flex gap-2.5">
                                <Check
                                    aria-hidden
                                    className="mt-0.5 size-[18px] shrink-0 text-dg-orange"
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
