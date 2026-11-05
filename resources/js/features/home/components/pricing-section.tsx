import { Check } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { BorderBeam } from '@/components/ui/border-beam';
import { MagicCard } from '@/components/ui/magic-card';
import { formatCurrency, landingLinks, promotionalPlan } from '../constants';
import { LandingButton } from './landing-button';
import { SectionHeading } from './section-heading';

const formatWholeCurrency = (value: number): string =>
    formatCurrency(value).replace(',00', '');

export function PricingSection() {
    const prefersReducedMotion = useReducedMotion();

    return (
        <section id="preco" className="scroll-mt-16 bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <SectionHeading
                    title="Um plano, o sistema inteiro"
                    description="Sem módulo cobrado à parte e sem limite de vendas. Você paga uma vez por ano e usa tudo o que o Operis oferece."
                />

                <article
                    aria-labelledby="plano-anual"
                    className="relative mx-auto mt-12 max-w-4xl rounded-[1.75rem] shadow-[0_30px_60px_-40px_rgb(0_0_0/0.35)]"
                >
                    <MagicCard
                        gradientSize={260}
                        gradientColor="#f6932314"
                        gradientFrom="#f69323"
                        gradientTo="#fbd38d"
                        className="rounded-[1.75rem]"
                    >
                        <div className="relative grid gap-10 overflow-hidden p-7 sm:p-10 md:grid-cols-[0.85fr_1.15fr]">
                            <p className="absolute top-7 -right-12 w-48 rotate-45 bg-dg-orange py-1.5 text-center text-sm font-bold text-dg-ink shadow-sm">
                                Promocional
                            </p>

                            <div>
                                <h3
                                    id="plano-anual"
                                    className="font-display text-xl font-bold text-dg-ink"
                                >
                                    Plano anual
                                </h3>
                                <p className="mt-1 pr-14 text-neutral-600 md:pr-0">
                                    Para a empresa que quer vender, controlar o
                                    estoque e receber em dia.
                                </p>

                                <p className="mt-8 flex items-baseline gap-2 text-dg-ink">
                                    <span className="font-display text-6xl font-extrabold tracking-[-0.04em]">
                                        {formatWholeCurrency(
                                            promotionalPlan.yearlyPrice,
                                        )}
                                    </span>
                                    <span className="text-lg text-neutral-600">
                                        /ano
                                    </span>
                                </p>
                                <p className="mt-2 text-sm text-neutral-500">
                                    Equivale a{' '}
                                    {formatWholeCurrency(
                                        promotionalPlan.monthlyEquivalent,
                                    )}{' '}
                                    por mês.
                                </p>

                                <LandingButton
                                    href={landingLinks.register}
                                    className="mt-8 w-full"
                                >
                                    Criar minha conta
                                </LandingButton>
                            </div>

                            <div className="md:border-l md:border-neutral-200 md:pl-10">
                                <h4 className="font-semibold text-dg-ink">
                                    O que você ganha
                                </h4>
                                <ul className="mt-4 space-y-3 text-[0.95rem] text-neutral-700">
                                    {promotionalPlan.benefits.map((benefit) => (
                                        <li
                                            key={benefit}
                                            className="flex gap-2.5"
                                        >
                                            <Check
                                                aria-hidden
                                                className="mt-0.5 size-[18px] shrink-0 text-dg-orange"
                                            />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </MagicCard>

                    {!prefersReducedMotion && (
                        <BorderBeam
                            size={140}
                            duration={9}
                            borderWidth={2}
                            colorFrom="#f69323"
                            colorTo="#fbd38d"
                        />
                    )}
                </article>
            </div>
        </section>
    );
}
