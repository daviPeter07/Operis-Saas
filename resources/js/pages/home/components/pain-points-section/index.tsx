import { painPoints } from '../../utils/constants';
import { SectionHeading } from '../section-heading';

export function PainPointsSection() {
    return (
        <section
            id="problemas"
            className="scroll-mt-16 border-t border-neutral-200 bg-white py-20 sm:py-28"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <SectionHeading
                    title="O que costuma dar trabalho no dia a dia"
                    description="Para quem vende, presta serviço ou guarda material, e o que muda quando estoque e contas ficam no mesmo sistema."
                />

                <ul className="mt-14 grid gap-5 md:grid-cols-2">
                    {painPoints.map(({ icon: Icon, title, pain, solution }) => (
                        <li
                            key={title}
                            className="flex flex-col rounded-2xl border border-neutral-200 p-6"
                        >
                            <Icon
                                aria-hidden
                                className="size-6 text-dg-orange"
                            />
                            <h3 className="mt-4 font-display text-xl font-bold tracking-[-0.02em] text-dg-ink">
                                {title}
                            </h3>
                            <p className="mt-2 text-[0.95rem] leading-relaxed text-neutral-500">
                                {pain}
                            </p>
                            <p className="mt-5 border-t border-neutral-200 pt-4 text-[0.95rem] leading-relaxed text-dg-ink">
                                <span className="font-semibold">
                                    Com o Operis:{' '}
                                </span>
                                {solution}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
