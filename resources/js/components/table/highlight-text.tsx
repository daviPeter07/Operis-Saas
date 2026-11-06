import type { ReactNode } from 'react';

function normalizeWithMap(text: string): { normalized: string; map: number[] } {
    let normalized = '';
    const map: number[] = [];
    let position = 0;

    for (const char of Array.from(text)) {
        const plain = char.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

        for (const piece of plain) {
            normalized += piece;
            map.push(position);
        }

        position += char.length;
    }

    map.push(position);

    return { normalized, map };
}

// Ignores case and accents, like the API search.
export function HighlightText({
    text,
    query,
}: {
    text: string;
    query: string;
}): ReactNode {
    const needle = normalizeWithMap(query.trim()).normalized;

    if (!needle) {
        return text;
    }

    const { normalized, map } = normalizeWithMap(text);
    const parts: ReactNode[] = [];
    let cursor = 0;
    let searchFrom = 0;

    while (searchFrom <= normalized.length - needle.length) {
        const found = normalized.indexOf(needle, searchFrom);

        if (found === -1) {
            break;
        }

        const start = map[found];
        const end = map[found + needle.length];

        if (start > cursor) {
            parts.push(text.slice(cursor, start));
        }

        parts.push(
            <mark
                key={start}
                className="rounded-[3px] bg-accent/25 px-px text-inherit"
            >
                {text.slice(start, end)}
            </mark>,
        );
        cursor = end;
        searchFrom = found + needle.length;
    }

    if (parts.length === 0) {
        return text;
    }

    if (cursor < text.length) {
        parts.push(text.slice(cursor));
    }

    return <>{parts}</>;
}
