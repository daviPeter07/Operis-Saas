import { ListFilter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FilterNoticeProps = {
    // e.g. "Status: Vencida", "Categoria: Periféricos", "contas da Venda #12"
    items: string[];
    onClear: () => void;
};

// Shown when another screen opened the table already filtered.
export function FilterNotice({ items, onClear }: FilterNoticeProps) {
    return (
        <div
            role="status"
            className="flex flex-col gap-2 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"
        >
            <p className="flex min-w-0 items-start gap-2">
                <ListFilter
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-accent"
                />
                <span className="min-w-0 break-words">
                    Mostrando só{' '}
                    {items.map((item, index) => (
                        <span key={item}>
                            <span className="font-semibold">{item}</span>
                            {index < items.length - 1 ? ', ' : ''}
                        </span>
                    ))}
                </span>
            </p>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5 self-stretch sm:self-auto"
                onClick={onClear}
            >
                <X className="size-4" />
                Ver tudo
            </Button>
        </div>
    );
}
