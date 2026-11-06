import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrencyBR } from '@/lib/format';
import { SETTLE_LABELS } from '../../utils/constants';
import { isOpenStatus } from '../../utils/functions';
import type { SelectionBarProps } from '../../utils/types';

// Batch actions for the rows checked in the table (they can be on other pages).
// Floats at the bottom of the screen (over the content area) so it never pushes the table.
export function SelectionBar({
    rows,
    isProcessing,
    onSettle,
    onPartial,
    onUndo,
    onClear,
}: SelectionBarProps) {
    const openRows = rows.filter((row) => isOpenStatus(row.status));
    const settledRows = rows.filter((row) => row.status === 'received');
    const allOpen = openRows.length === rows.length;
    const allSettled = settledRows.length === rows.length;
    const total = allOpen
        ? openRows.reduce((sum, row) => sum + row.remaining, 0)
        : rows.reduce((sum, row) => sum + row.amount, 0);

    return (
        <>
            <div aria-hidden className="h-28" />
            <div
                role="region"
                aria-label="Ações das contas selecionadas"
                className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 flex-col gap-3 rounded-xl border border-accent/40 bg-card p-4 shadow-xl sm:flex-row sm:items-center sm:justify-between md:ml-[calc(var(--sidebar-width,0rem)/2)] md:w-[calc(100vw-var(--sidebar-width,0rem)-3rem)]"
            >
                <div>
                    <p className="font-semibold">
                        {rows.length}{' '}
                        {rows.length === 1
                            ? 'conta selecionada'
                            : 'contas selecionadas'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {allOpen ? 'Em aberto' : 'Total'}:{' '}
                        <span className="font-medium text-foreground tabular-nums">
                            {formatCurrencyBR(total)}
                        </span>
                    </p>
                    {!allOpen && !allSettled ? (
                        <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                            Selecione só contas em aberto ou só contas já
                            baixadas para aplicar uma ação.
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {allOpen ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isProcessing || openRows.length !== 1}
                                title={
                                    openRows.length !== 1
                                        ? 'Escolha uma conta só para a baixa parcial'
                                        : undefined
                                }
                                onClick={onPartial}
                            >
                                {SETTLE_LABELS.partial}
                            </Button>
                            <Button
                                type="button"
                                disabled={isProcessing}
                                onClick={onSettle}
                            >
                                {isProcessing
                                    ? 'Processando...'
                                    : SETTLE_LABELS.settle}
                            </Button>
                        </>
                    ) : null}
                    {allSettled ? (
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isProcessing}
                            onClick={onUndo}
                        >
                            {isProcessing
                                ? 'Processando...'
                                : SETTLE_LABELS.undo}
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Limpar seleção"
                        onClick={onClear}
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            </div>
        </>
    );
}
