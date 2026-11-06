import { CircleCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrencyBR } from '@/lib/format';
import type { CartAddedNoticeProps } from '../../utils/types';

export function CartAddedNotice({
    added,
    itemCount,
    total,
    onViewCart,
    onDismiss,
}: CartAddedNoticeProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            className="flex animate-in items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 duration-300 fade-in slide-in-from-top-2"
        >
            <CircleCheck
                aria-hidden
                className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
            />
            <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold">
                    {added.quantity} × {added.productName} adicionado ao
                    carrinho
                </p>
                <p className="text-xs text-muted-foreground">
                    Carrinho com {itemCount}{' '}
                    {itemCount === 1 ? 'item' : 'itens'} ·{' '}
                    {formatCurrencyBR(total)}
                </p>
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="hidden shrink-0 sm:inline-flex"
                onClick={onViewCart}
            >
                Ver carrinho
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                aria-label="Fechar aviso"
                onClick={onDismiss}
            >
                <X className="size-4" />
            </Button>
        </div>
    );
}
