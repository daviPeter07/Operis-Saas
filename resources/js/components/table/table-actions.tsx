import * as React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
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
                    className="h-8 w-8"
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
                    className="h-8 w-8"
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
                    className="h-8 w-8 text-destructive hover:text-destructive"
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
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalhes
                    </DropdownMenuItem>
                )}
                {showEdit && onEdit && (
                    <>
                        {showView && <DropdownMenuSeparator />}
                        <DropdownMenuItem onClick={onEdit}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                    </>
                )}
                {showDelete && onDelete && (
                    <>
                        {(showView || showEdit) && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                            onClick={onDelete}
                            className="text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
