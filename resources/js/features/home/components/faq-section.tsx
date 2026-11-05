import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import type { FrequentlyAskedQuestion } from '../constants';
import { SectionHeading } from './section-heading';

type FaqSectionProps = {
    questions: FrequentlyAskedQuestion[];
};

export function FaqSection({ questions }: FaqSectionProps) {
    return (
        <section
            id="duvidas"
            className="scroll-mt-16 border-t border-neutral-200 bg-white py-20 sm:py-28"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <SectionHeading
                    title="Perguntas frequentes"
                    description="Como o Operis funciona no dia a dia da sua empresa e o que está incluído no plano."
                />

                <Accordion
                    type="single"
                    collapsible
                    className="mx-auto mt-12 max-w-3xl border-t border-neutral-200"
                >
                    {questions.map(({ question, answer }) => (
                        <AccordionItem
                            key={question}
                            value={question}
                            className="border-b border-neutral-200"
                        >
                            <AccordionTrigger className="py-5 text-base font-semibold text-dg-ink hover:no-underline focus-visible:ring-dg-orange/60">
                                {question}
                            </AccordionTrigger>
                            <AccordionContent className="pb-5 text-[0.98rem] leading-relaxed text-neutral-600">
                                {answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
