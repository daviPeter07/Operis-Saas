import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useWorkspace } from '../workspace-context';

interface CompanySwitcherModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CompanySwitcherModal({ open, onOpenChange }: CompanySwitcherModalProps) {
    const { companies, currentCompany, switchCompany } = useWorkspace();

    const handleSwitch = (companyId: string) => {
        switchCompany(companyId);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Switch Company</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2 py-4">
                    {companies.map((company) => (
                        <Button
                            key={company.id}
                            variant={company.id === currentCompany.id ? 'secondary' : 'ghost'}
                            className="justify-start h-auto py-3 px-4"
                            onClick={() => handleSwitch(company.id)}
                        >
                            <div className="flex items-center gap-3 w-full">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-white"
                                    style={{ backgroundColor: company.primaryColor }}
                                >
                                    {company.initials}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium">{company.name}</div>
                                    <div className="text-xs text-muted-foreground capitalize">
                                        {company.role}
                                    </div>
                                </div>
                                {company.id === currentCompany.id && (
                                    <Check className="w-4 h-4 text-green-600" />
                                )}
                            </div>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}