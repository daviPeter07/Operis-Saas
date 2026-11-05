import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { frequentlyAskedQuestions } from '../constants';

export function FaqSection() {
    return (
        <section
            id="duvidas"
            className="scroll-mt-16 border-t border-neutral-200 bg-white py-20 sm:py-28"
        >
            <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                <div>
                    <h2 className="font-display text-3xl leading-tight font-bold tracking-[-0.03em] text-dg-ink sm:text-[2.6rem]">
                        Perguntas frequentes
                    </h2>
                    <p className="mt-4 max-w-sm text-[1.05rem] leading-relaxed text-neutral-600">
                        Como o Operis funciona no dia a dia da loja e o que está
                        incluído no plano.
                    </p>
                </div>

                <Accordion
                    type="single"
                    collapsible
                    className="border-t border-neutral-200"
                >
                    {frequentlyAskedQuestions.map(({ question, answer }) => (
                        <AccordionItem
                            key={question}
                            value={question}
                            className="border-b border-neutral-200"
                        >
                            <AccordionTrigger className="py-5 text-base font-semibold text-dg-ink hover:no-underline focus-visible:ring-dg-orange/60">
                                {question}
                            </AccordionTrigger>
                            <AccordionContent className="max-w-[60ch] pb-5 text-[0.98rem] leading-relaxed text-neutral-600">
                                {answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
