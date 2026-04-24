import { Eye, Pencil, Trash2 } from 'lucide-react';
import { MoreHorizontal } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface TableActionsProps {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    showView?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    className?: string;
}

export function TableActions({
    onView,
    onEdit,
    onDelete,
    showView = true,
    showEdit = true,
    showDelete = true,
    className,
}: TableActionsProps) {
    const hasActions = showView || showEdit || showDelete;

    if (!hasActions) {
        return null;
    }

    return (
        <div className={cn('flex items-center justify-end gap-1', className)}>
            {showView && onView && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                    onClick={onView}
                    title="Ver detalhes"
                >
                    <Eye className="h-4 w-4" />
                </Button>
            )}
            {showEdit && onEdit && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/40"
                    onClick={onEdit}
                    title="Editar"
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            )}
            {showDelete && onDelete && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                    onClick={onDelete}
                    title="Excluir"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}

export interface TableActionsDropdownProps {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    showView?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    className?: string;
}

export function TableActionsDropdown({
    onView,
    onEdit,
    onDelete,
    showView = true,
    showEdit = true,
    showDelete = true,
    className,
}: TableActionsDropdownProps) {
    const hasActions = showView || showEdit || showDelete;

    if (!hasActions) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn('h-8 w-8 p-0', className)}
                >
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {showView && onView && (
                    <DropdownMenuItem onClick={onView}>
                        <Eye className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Ver detalhes
                    </DropdownMenuItem>
                )}
                {showEdit && onEdit && (
                    <>
                        {showView && <DropdownMenuSeparator />}
                        <DropdownMenuItem onClick={onEdit}>
                            <Pencil className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                            Editar
                        </DropdownMenuItem>
                    </>
                )}
                {showDelete && onDelete && (
                    <>
                        {(showView || showEdit) && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                            onClick={onDelete}
                            className="text-red-600 focus:text-red-700 dark:text-red-400 dark:focus:text-red-300"
                        >
                            <Trash2 className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
                            Excluir
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
