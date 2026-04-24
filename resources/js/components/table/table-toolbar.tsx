import * as React from 'react';
import { Search, Filter, Plus, Upload, Download, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface TableToolbarProps {
    searchValue?: string;
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
}

export function TableToolbar({
    searchValue = '',
    onSearchChange,
    onOpenFilters,
    hasActiveFilters = false,
    onCreate,
    onImport,
    onExportExcel,
    onExportPDF,
    showCreate = true,
    showImport = true,
    showExport = true,
    className,
}: TableToolbarProps) {
    const [localSearch, setLocalSearch] = React.useState(searchValue);

    React.useEffect(() => {
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
                    placeholder="Buscar..."
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
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenFilters}
                    className="gap-2"
                >
                    <Filter className="h-4 w-4" />
                    Filtros
                    {hasActiveFilters && (
                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            !
                        </span>
                    )}
                </Button>

                {showCreate && onCreate && (
                    <Button size="sm" onClick={onCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Criar
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
