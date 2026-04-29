export function isEditableElement(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    return Boolean(
        target.closest(
            'input, textarea, select, [contenteditable="true"], [data-hotkey-scope="typing"]',
        ),
    );
}

export function getAltShortcutLabel(key: string): string {
    return `Alt+${key.toUpperCase()}`;
}

export function matchesAltDigitShortcut(
    event: KeyboardEvent,
    digit: string,
): boolean {
    return (
        event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        event.key === digit
    );
}

export function matchesAltLetterShortcut(
    event: KeyboardEvent,
    letter: string,
): boolean {
    return (
        event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === letter.toLowerCase()
    );
}
