import { Building2 } from 'lucide-react';
import { useWorkspace } from '@/components/features/dashboard/workspace-context';

export default function AppLogo() {
    const { currentCompany } = useWorkspace();

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Building2 className="size-5 text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-accent">
                    {currentCompany.name}
                </span>
            </div>
        </>
    );
}
