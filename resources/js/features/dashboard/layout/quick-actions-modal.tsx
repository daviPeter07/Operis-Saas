import { router } from '@inertiajs/react';
import { Plus, Users, ShoppingCart, Receipt, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useWorkspace } from '../workspace-context';

interface QuickActionsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const actionConfig: Record<
    string,
    { icon: typeof Plus; href: string }
> = {
    'create-client': { icon: Users, href: '/dashboard/clients?action=create-client' },
    'create-sale': { icon: ShoppingCart, href: '/dashboard/sales?action=create-sale' },
    'create-purchase': { icon: Receipt, href: '/dashboard/purchases?action=create-purchase' },
    'create-expense': { icon: Receipt, href: '/dashboard/expenses?action=create-expense' },
    'create-brand': { icon: Tag, href: '/dashboard/brands?action=create-brand' },
};

export function QuickActionsModal({
    open,
    onOpenChange,
}: QuickActionsModalProps) {
    const { quickActions } = useWorkspace();

    const handleActionClick = (key: string) => {
        const config = actionConfig[key];

        if (config) {
            router.visit(config.href, {
                onSuccess: () => {
                    onOpenChange(false);
                },
            });
        } else {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Quick Actions</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3 py-4">
                    {quickActions.map((action) => {
                        const config = actionConfig[action.key];
                        const Icon = config?.icon || Plus;

                        return (
                            <Button
                                key={action.key}
                                variant="outline"
                                className="flex h-auto flex-col items-center gap-2 py-4"
                                onClick={() => handleActionClick(action.key)}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-sm font-medium">
                                    {action.label}
                                </span>
                            </Button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
