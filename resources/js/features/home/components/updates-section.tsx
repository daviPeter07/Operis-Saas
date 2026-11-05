import { cn } from '@/lib/utils';
import type { LandingUpdate, LandingUpdateType } from '../constants';
import { SectionHeading } from './section-heading';

const typeLabels: Record<LandingUpdateType, string> = {
    novidade: 'Novidade',
    melhoria: 'Melhoria',
    correcao: 'Correção',
};

const typeClassNames: Record<LandingUpdateType, string> = {
    novidade: 'bg-dg-orange/15 text-[#9a5208]',
    melhoria: 'bg-blue-500/10 text-blue-700',
    correcao: 'bg-emerald-500/10 text-emerald-700',
};

/** Formats an ISO date (YYYY-MM-DD) without timezone shifts, e.g. "5 de nov. de 2026". */
function formatUpdateDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

type UpdatesSectionProps = {
    updates: LandingUpdate[];
};

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
                    description="O Operis recebe melhorias o tempo todo, sem você precisar instalar nada. Veja o que mudou recentemente."
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
