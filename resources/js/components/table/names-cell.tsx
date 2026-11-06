import { HighlightText } from '@/components/table/highlight-text';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { matchesSearch } from '@/utils/search-text';

type NamesCellProps = {
    names: string[];
    query?: string;
    className?: string;
};

// First name in full (wrapping) plus a "+N" chip that lists the others on hover.
// While the column is searched, the matching name comes first, highlighted.
export function NamesCell({ names, query = '', className }: NamesCellProps) {
    if (names.length === 0) {
        return <span className="text-muted-foreground">-</span>;
    }

    const matchIndex = query
        ? names.findIndex((name) => matchesSearch(name, query))
        : -1;
    const first = matchIndex > 0 ? names[matchIndex] : names[0];
    const others = names.filter((name) => name !== first);

    return (
        <span className={cn('block max-w-60 min-w-24 break-words', className)}>
            <span>
                {matchIndex >= 0 ? (
                    <HighlightText text={first} query={query} />
                ) : (
                    first
                )}
            </span>
            {others.length > 0 ? (
                <>
                    {' '}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                aria-label={`Mais ${others.length}: ${others.join(', ')}`}
                                className="inline-block cursor-default rounded-full bg-foreground/10 px-1.5 text-xs font-bold text-foreground/75 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                                +{others.length}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-80">
                            {others.join(', ')}
                        </TooltipContent>
                    </Tooltip>
                </>
            ) : null}
        </span>
    );
}
