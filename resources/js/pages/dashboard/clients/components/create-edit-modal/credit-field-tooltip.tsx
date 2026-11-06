import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { CREDIT_DISABLED_TOOLTIP } from '../../utils/constants';
import type { CreditFieldTooltipProps } from '../../utils/types';

export function CreditFieldTooltip({
    disabled,
    children,
}: CreditFieldTooltipProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div>{children}</div>
                </TooltipTrigger>
                {disabled ? (
                    <TooltipContent>{CREDIT_DISABLED_TOOLTIP}</TooltipContent>
                ) : null}
            </Tooltip>
        </TooltipProvider>
    );
}
