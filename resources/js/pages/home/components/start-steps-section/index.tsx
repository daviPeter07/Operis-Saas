import { cn } from '@/lib/utils';
import { startSteps } from '../../utils/constants';
import { getContactWhatsAppUrl } from '../../utils/functions';
import { FirstSaleReceipt } from '../first-sale-receipt';
import { LandingButton } from '../landing-button';

/**
 * The path from the first message to the first sale. It ends on a small
 * receipt, closing the loop with the receipt printed in the hero.
 */
export function StartStepsSection() {
    const lastIndex = startSteps.length - 1;

    return (
        <section
            id="como-comecar"
            className="scroll-mt-16 bg-dg-paper py-20 sm:py-28"
        >
            <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
                <div className="lg:pt-2">
                    <h2 className="font-display text-3xl leading-tight font-bold tracking-[-0.03em] text-dg-ink sm:text-[2.6rem]">
                        Como começar
                    </h2>
                    <p className="mt-4 max-w-sm text-[1.05rem] leading-relaxed text-neutral-600">
                        O Operis roda no navegador, então não há nada para
                        instalar.
                    </p>
                    <LandingButton
                        href={getContactWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-8"
                    >
                        Conversar no WhatsApp
                    </LandingButton>
                </div>

                <ol className="relative">
                    {startSteps.map((step, index) => {
                        const isLast = index === lastIndex;

                        return (
                            <li
                                key={step.title}
                                className={cn(
                                    'relative grid grid-cols-[2.5rem_1fr] gap-x-5',
                                    !isLast && 'pb-10',
                                )}
                            >
                                {isLast ? null : (
                                    <span
                                        aria-hidden
                                        className="absolute top-10 bottom-0 left-5 w-px bg-dg-orange/40"
                                    />
                                )}
                                <span
                                    aria-hidden
                                    className={cn(
                                        'relative flex size-10 items-center justify-center rounded-full font-display text-sm font-bold',
                                        isLast
                                            ? 'bg-dg-orange text-dg-ink'
                                            : 'border border-dg-orange/50 bg-dg-paper text-dg-ink',
                                    )}
                                >
                                    {index + 1}
                                </span>

                                <div
                                    className={cn(
                                        'pt-1.5',
                                        isLast &&
                                            'flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between',
                                    )}
                                >
                                    <div className="max-w-sm">
                                        <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-dg-ink">
                                            {step.title}
                                        </h3>
                                        <p className="mt-1.5 text-[0.95rem] leading-relaxed text-neutral-600">
                                            {step.description}
                                        </p>
                                    </div>

                                    {isLast ? <FirstSaleReceipt /> : null}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}
