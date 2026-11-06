import type { SectionHeadingProps } from '../../utils/types';

/** Centered section title used by the pricing and FAQ sections. */
export function SectionHeading({ title, description }: SectionHeadingProps) {
    return (
        <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl leading-tight font-bold tracking-[-0.03em] text-dg-ink sm:text-[2.6rem]">
                {title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[1.05rem] leading-relaxed text-neutral-600">
                {description}
            </p>
        </div>
    );
}
