import type { NamesCellProps } from '../../utils/types';

// Keeps the row short: first name plus how many more, full list on hover.
export function NamesCell({ names }: NamesCellProps) {
    if (names.length === 0) {
        return <span className="text-muted-foreground">-</span>;
    }

    const extra = names.length - 1;

    return (
        <span
            title={names.join(', ')}
            className="inline-flex max-w-48 items-center gap-1.5"
        >
            <span className="truncate">{names[0]}</span>
            {extra > 0 ? (
                <span className="shrink-0 rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                    +{extra}
                </span>
            ) : null}
        </span>
    );
}
