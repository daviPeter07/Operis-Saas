import { cn } from '@/lib/utils';
import { typeClassNames, typeLabels } from '../../utils/constants';
import { formatUpdateDate } from '../../utils/functions';
import type { UpdatesSectionProps } from '../../utils/types';
import { SectionHeading } from '../section-heading';

export function UpdatesSection({ updates }: UpdatesSectionProps) {
    if (updates.length === 0) {
        return null;
    }

    return (
        <section
            id="atualizacoes"
            className="scroll-mt-16 bg-white py-20 sm:py-28"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <SectionHeading
                    title="Últimas atualizações"
                    description="O Operis é atualizado com frequência, sem você instalar nada. Veja o que mudou por último."
                />

                <ol className="mx-auto mt-12 max-w-3xl pl-2 sm:pl-0">
                    {updates.map((update) => (
                        <li
                            key={`${update.date}-${update.title}`}
                            className="group grid sm:grid-cols-[8.5rem_1fr] sm:gap-x-8"
                        >
                            <time
                                dateTime={update.date}
                                className="border-l-2 border-neutral-200 pb-1.5 pl-7 text-sm text-neutral-500 sm:border-0 sm:pt-1 sm:pb-0 sm:pl-0 sm:text-right"
                            >
                                {formatUpdateDate(update.date)}
                            </time>

                            <div className="relative border-l-2 border-neutral-200 pb-10 pl-7 group-last:border-transparent group-last:pb-0">
                                <span
                                    aria-hidden
                                    className="absolute top-1.5 -left-[7px] size-3 rounded-full bg-dg-orange ring-4 ring-white"
                                />

                                <div className="flex flex-wrap items-center gap-2.5">
                                    <span
                                        className={cn(
                                            'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                            typeClassNames[update.type],
                                        )}
                                    >
                                        {typeLabels[update.type]}
                                    </span>
                                    <h3 className="font-display text-lg font-bold text-dg-ink">
                                        {update.title}
                                    </h3>
                                </div>
                                <p className="mt-2 max-w-xl leading-relaxed text-neutral-600">
                                    {update.description}
                                </p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
