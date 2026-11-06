// Same rule as the API search: ignores case and accents.
export function normalizeSearchText(value: string): string {
    return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function matchesSearch(text: string, query: string): boolean {
    const needle = normalizeSearchText(query);

    return needle !== '' && normalizeSearchText(text).includes(needle);
}
