import * as React from 'react';

export function useFormState<T extends Record<string, string>>(
    initialState: T,
    resetKey?: unknown,
) {
    const [form, setForm] = React.useState<T>(initialState);

    React.useEffect(() => {
        if (resetKey) {
            setForm(initialState);
        }
    }, [initialState, resetKey]);

    const setField = React.useCallback(
        <K extends keyof T>(key: K, value: T[K]) => {
            setForm((prev) => ({ ...prev, [key]: value }));
        },
        [],
    );

    return { form, setForm, setField };
}
