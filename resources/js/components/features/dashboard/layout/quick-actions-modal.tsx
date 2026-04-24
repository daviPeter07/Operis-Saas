import { Plus } from 'lucide-react';
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

const actionIcons: Record<string, typeof Plus> = {
    'create-client': Plus,
    'create-product': Plus,
    'create-sale': Plus,
    'create-purchase': Plus,
    'create-expense': Plus,
    'create-brand': Plus,
};

export function QuickActionsModal({ open, onOpenChange }: QuickActionsModalProps) {
    const { quickActions } = useWorkspace();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Quick Actions</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3 py-4">
                    {quickActions.map((action) => {
                        const Icon = actionIcons[action.key] || Plus;

                        return (
                            <Button
                                key={action.key}
                                variant="outline"
                                className="h-auto py-4 flex flex-col items-center gap-2"
                                onClick={() => {
                                    console.log('Action:', action.key);
                                    onOpenChange(false);
                                }}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-sm font-medium">{action.label}</span>
                            </Button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}