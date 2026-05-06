import { Search, Plus, Upload, Download, X } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    getAltShortcutLabel,
    isEditableElement,
    matchesAltLetterShortcut,
} from '@/lib/keyboard-shortcuts';
import { cn } from '@/lib/utils';

export interface TableToolbarProps {
    searchValue?: string;
    searchPlaceholder?: string;
    onSearchChange?: (value: string) => void;
    onOpenFilters?: () => void;
    hasActiveFilters?: boolean;
    onCreate?: () => void;
    onImport?: () => void;
    onExportExcel?: () => void;
    onExportPDF?: () => void;
    showCreate?: boolean;
    showImport?: boolean;
    showExport?: boolean;
    className?: string;
    extraContent?: React.ReactNode;
}

export function TableToolbar({
    searchValue = '',
    searchPlaceholder = 'Buscar...',
    onSearchChange,
    onCreate,
    onImport,
    onExportExcel,
    onExportPDF,
    showCreate = true,
    showImport = true,
    showExport = true,
    className,
    extraContent,
}: TableToolbarProps) {
    const [localSearch, setLocalSearch] = React.useState(searchValue);

    React.useEffect(() => {
        if (!onCreate || !showCreate) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (!matchesAltLetterShortcut(event, 'n')) {
                return;
            }

            if (isEditableElement(event.target)) {
                return;
            }

            event.preventDefault();
            onCreate();
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onCreate, showCreate]);

    React.useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalSearch(searchValue);
    }, [searchValue]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalSearch(value);
        onSearchChange?.(value);
    };

    const handleClearSearch = () => {
        setLocalSearch('');
        onSearchChange?.('');
    };

    return (
        <div
            className={cn(
                'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
                className,
            )}
        >
            <div className="relative w-full max-w-sm sm:flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder={searchPlaceholder}
                    value={localSearch}
                    onChange={handleSearchChange}
                    className="pr-9 pl-9"
                />
                {localSearch && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                        onClick={handleClearSearch}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 sm:ml-auto sm:flex-nowrap">
                {extraContent}

                {showCreate && onCreate && (
                    <Button size="sm" onClick={onCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Criar
                        <Badge
                            variant="outline"
                            className="ml-1 h-5 min-w-5 rounded-md border-border/70 bg-background px-1.5 text-[10px] font-semibold text-foreground shadow-sm dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-950"
                        >
                            {getAltShortcutLabel('N')}
                        </Badge>
                    </Button>
                )}

                {showImport && onImport && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onImport}
                        className="gap-2"
                    >
                        <Upload className="h-4 w-4" />
                        Importar
                    </Button>
                )}

                {showExport && (onExportExcel || onExportPDF) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Exportar
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {onExportExcel && (
                                <DropdownMenuItem onClick={onExportExcel}>
                                    Exportar como Excel
                                </DropdownMenuItem>
                            )}
                            {onExportPDF && (
                                <DropdownMenuItem onClick={onExportPDF}>
                                    Exportar como PDF
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
}
