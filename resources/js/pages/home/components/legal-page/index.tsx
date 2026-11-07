import { Head } from '@inertiajs/react';
import { useLayoutEffect } from 'react';
import { lockLightTheme } from '@/hooks/use-appearance';
import { LEGAL_UPDATED_AT, landingLinks } from '../../utils/constants';
import { formatLongDate } from '../../utils/functions';
import type { LegalPageProps } from '../../utils/types';
import { LandingFooter } from '../landing-footer';
import { LandingHeader } from '../landing-header';

/** Termos de Uso and Política de Privacidade, with the landing header and footer. */
export function LegalPage({ document }: LegalPageProps) {
    useLayoutEffect(() => lockLightTheme(), []);

    return (
        <>
            <Head title={document.title}>
                <meta name="description" content={document.description} />
            </Head>
            <div className="flex min-h-screen flex-col bg-white font-sans text-dg-ink antialiased">
                <LandingHeader />
                <main className="flex-1">
                    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
                        <a
                            href={landingLinks.home}
                            className="rounded-md text-sm text-neutral-500 outline-none hover:text-dg-ink focus-visible:ring-3 focus-visible:ring-dg-orange/60"
                        >
                            ← Voltar para o início
                        </a>
                        <h1 className="mt-6 font-display text-4xl leading-tight font-extrabold tracking-[-0.03em] sm:text-5xl">
                            {document.title}
                        </h1>
                        <p className="mt-4 text-lg leading-relaxed text-neutral-600">
                            {document.description}
                        </p>
                        <p className="mt-3 text-sm text-neutral-500">
                            Última atualização:{' '}
                            <time dateTime={LEGAL_UPDATED_AT}>
                                {formatLongDate(LEGAL_UPDATED_AT)}
                            </time>
                        </p>

                        <div className="mt-12 space-y-10">
                            {document.sections.map((section, index) => (
                                <section key={section.title}>
                                    <h2 className="font-display text-xl font-bold tracking-[-0.02em]">
                                        {index + 1}. {section.title}
                                    </h2>
                                    {section.paragraphs?.map((paragraph) => (
                                        <p
                                            key={paragraph}
                                            className="mt-3 leading-relaxed text-neutral-700"
                                        >
                                            {paragraph}
                                        </p>
                                    ))}
                                    {section.items ? (
                                        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-neutral-700 marker:text-dg-orange">
                                            {section.items.map((item) => (
                                                <li key={item}>{item}</li>
                                            ))}
                                        </ul>
                                    ) : null}
                                    {section.note ? (
                                        <p className="mt-3 leading-relaxed text-neutral-700">
                                            {section.note}
                                        </p>
                                    ) : null}
                                </section>
                            ))}
                        </div>
                    </article>
                </main>
                <LandingFooter />
            </div>
        </>
    );
}
