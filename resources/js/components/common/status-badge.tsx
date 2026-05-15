import { Badge } from '@/components/ui/badge';
import { translateStatus } from '@/lib/format';

type StatusBadgeProps = {
    status: string;
};

const statusClassMap: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    partial: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    received: 'bg-emerald-100 text-emerald-800',
    paid: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
};

export function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <Badge
            className={statusClassMap[status] ?? 'bg-gray-100 text-gray-800'}
        >
            {translateStatus(status)}
        </Badge>
    );
}
