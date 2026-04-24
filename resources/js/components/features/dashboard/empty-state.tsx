import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

interface EmptyStateProps {
    icon?: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({
    icon: Icon = Package,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
            {action && (
                <Button onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    );
}
