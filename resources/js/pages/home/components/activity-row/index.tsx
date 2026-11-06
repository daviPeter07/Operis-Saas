import { cn } from '@/lib/utils';
import type { DemoActivity } from '../../utils/types';

export function ActivityRow({
    activity,
    compact = false,
}: {
    activity: DemoActivity;
    compact?: boolean;
}) {
    const Icon = activity.icon;

    return (
        <li className="flex items-center gap-3 py-2.5">
            <span
                className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full',
                    activity.iconClassName,
                )}
            >
                <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                    {activity.description}
                </p>
                <p className="text-xs text-neutral-500">
                    {compact
                        ? activity.time
                        : `${activity.responsible}, ${activity.time}`}
                </p>
            </div>
            {activity.amount && (
                <span className="text-sm font-semibold tabular-nums">
                    {activity.amount}
                </span>
            )}
        </li>
    );
}
