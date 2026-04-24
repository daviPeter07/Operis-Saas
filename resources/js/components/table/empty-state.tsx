import { Inbox, Search, FileX } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type EmptyStateVariant = 'default' | 'search' | 'no-results';

export interface EmptyStateProps {
    variant?: EmptyStateVariant;
    title?: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({
    variant = 'default',
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    const variantConfig = {
        default: {
            icon: Inbox,
            defaultTitle: 'Nenhum registro encontrado',
            defaultDescription:
                'Comece adicionando novos registros ao sistema.',
        },
        search: {
            icon: Search,
            defaultTitle: 'Nenhum resultado encontrado',
            defaultDescription:
                'Tente ajustar sua busca ou filtros para encontrar o que procura.',
        },
        'no-results': {
            icon: FileX,
            defaultTitle: 'Sem resultados',
            defaultDescription:
                'Os filtros aplicados não retornaram nenhum registro.',
        },
    };

    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center px-4 py-12 text-center',
                className,
            )}
        >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Icon className="h-8 w-8 text-muted-foreground" />
            </div>

            <h3 className="mt-4 text-lg font-semibold">
                {title ?? config.defaultTitle}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {description ?? config.defaultDescription}
            </p>

            {action && (
                <Button onClick={action.onClick} className="mt-4">
                    {action.label}
                </Button>
            )}
        </div>
    );
}

export interface TableEmptyStateProps {
    searchTerm?: string;
    hasFilters?: boolean;
    onClearSearch?: () => void;
    onClearFilters?: () => void;
    className?: string;
}

export function TableEmptyState({
    searchTerm,
    hasFilters,
    onClearSearch,
    onClearFilters,
    className,
}: TableEmptyStateProps) {
    if (searchTerm || hasFilters) {
        return (
            <div className="py-8">
                <EmptyState
                    variant="search"
                    className={className}
                    action={
                        searchTerm || hasFilters
                            ? {
                                  label: searchTerm
                                      ? 'Limpar busca'
                                      : 'Limpar filtros',
                                  onClick: searchTerm
                                      ? onClearSearch!
                                      : onClearFilters!,
                              }
                            : undefined
                    }
                />
            </div>
        );
    }

    return (
        <div className="py-8">
            <EmptyState className={className} />
        </div>
    );
}
