import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { QuickCreateButtonProps } from '../../utils/types';

export function QuickCreateButton({ label, onClick }: QuickCreateButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={label}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={onClick}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}
