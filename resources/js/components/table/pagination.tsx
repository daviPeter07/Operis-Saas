import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PaginationProps extends React.ComponentPropsWithoutRef<'nav'> {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    siblingCount?: number;
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 1,
    className,
    ...props
}: PaginationProps) {
    const range = React.useMemo(() => {
        const left = Math.max(2, currentPage - siblingCount);
        const right = Math.min(totalPages - 1, currentPage + siblingCount);

        const pages: (number | 'ellipsis')[] = [];

        pages.push(1);

        if (left > 2) {
            pages.push('ellipsis');
        }

        for (let i = left; i <= right; i++) {
            pages.push(i);
        }

        if (right < totalPages - 1) {
            pages.push('ellipsis');
        }

        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    }, [currentPage, totalPages, siblingCount]);

    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav
            aria-label="Paginação"
            className={cn('flex items-center justify-center gap-1', className)}
            {...props}
        >
            <Button
                variant="outline"
                size="icon"
                className="size-9"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                aria-label="Primeira página"
            >
                <ChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="icon"
                className="size-9"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Página anterior"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
                {range.map((page, index) => {
                    if (page === 'ellipsis') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="flex h-9 w-9 items-center justify-center text-muted-foreground"
                            >
                                ...
                            </span>
                        );
                    }

                    return (
                        <Button
                            key={page}
                            variant={
                                currentPage === page ? 'default' : 'outline'
                            }
                            size="icon"
                            className={cn(
                                'h-9 w-9',
                                currentPage === page && 'pointer-events-none',
                            )}
                            onClick={() => onPageChange(page as number)}
                        >
                            {page}
                        </Button>
                    );
                })}
            </div>

            <Button
                variant="outline"
                size="icon"
                className="size-9"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Próxima página"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="icon"
                className="size-9"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Última página"
            >
                <ChevronsRight className="h-4 w-4" />
            </Button>
        </nav>
    );
}

export interface PaginationInfoProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    className?: string;
}

export function PaginationInfo({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    className,
}: PaginationInfoProps) {
    const startItem = Math.min(
        (currentPage - 1) * itemsPerPage + 1,
        totalItems,
    );
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalItems === 0) {
        return (
            <div
                className={cn(
                    'text-xs text-muted-foreground sm:text-sm',
                    className,
                )}
            >
                Nenhum registro encontrado
            </div>
        );
    }

    if (totalItems === 1) {
        return (
            <div
                className={cn(
                    'text-xs text-muted-foreground sm:text-sm',
                    className,
                )}
            >
                1 registro
            </div>
        );
    }

    if (currentPage === totalPages && totalItems === endItem) {
        return (
            <div
                className={cn(
                    'text-xs text-muted-foreground sm:text-sm',
                    className,
                )}
            >
                {totalItems} registros no total
            </div>
        );
    }

    return (
        <div
            className={cn(
                'text-xs text-muted-foreground sm:text-sm',
                className,
            )}
        >
            {startItem}-{endItem} de {totalItems} registros
            {totalPages > 1 && (
                <span className="hidden sm:inline">
                    {' '}
                    · página {currentPage}/{totalPages}
                </span>
            )}
        </div>
    );
}
