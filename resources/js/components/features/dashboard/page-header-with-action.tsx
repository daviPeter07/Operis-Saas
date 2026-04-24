import { type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderWithActionProps {
    title: string;
    description?: string;
    children?: ReactNode;
}

export function PageHeaderWithAction({
    title,
    description,
    children,
}: PageHeaderWithActionProps) {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {children}
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Quick Action
                    </Button>
                </div>
            </div>
        </div>
    );
}
