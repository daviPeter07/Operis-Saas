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

export function CompanySwitcherModal({
    open,
    onOpenChange,
}: CompanySwitcherModalProps) {
    const { companies, currentCompany, switchCompany } = useWorkspace();

    const handleSwitch = (companyId: string) => {
        switchCompany(companyId);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Trocar empresa</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2 py-4">
                    {companies.map((company) => (
                        <Button
                            key={company.id}
                            variant={
                                company.id === currentCompany.id
                                    ? 'secondary'
                                    : 'ghost'
                            }
                            className="h-auto justify-start rounded-xl px-4 py-3"
                            style={
                                company.id === currentCompany.id
                                    ? {
                                          boxShadow: `inset 0 0 0 1px ${company.primaryColor}`,
                                      }
                                    : undefined
                            }
                            onClick={() => handleSwitch(company.id)}
                        >
                            <div className="flex w-full items-center gap-3">
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-xl font-semibold text-white"
                                    style={{
                                        background: `linear-gradient(135deg, ${company.primaryColor}, ${company.secondaryColor})`,
                                    }}
                                >
                                    {company.initials}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium">
                                        {company.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {company.description}
                                    </div>
                                    <div className="mt-1 text-[11px] text-muted-foreground capitalize">
                                        {company.role}
                                    </div>
                                </div>
                                {company.id === currentCompany.id && (
                                    <Check
                                        className="h-4 w-4"
                                        style={{ color: company.primaryColor }}
                                    />
                                )}
                            </div>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
