import { Building2 } from 'lucide-react';
import { useWorkspace } from '@/components/features/dashboard/workspace-context';

export default function AppLogo() {
    const { currentCompany } = useWorkspace();

    return (
        <>
            <div
                className="flex aspect-square size-9 items-center justify-center rounded-xl text-white shadow-sm"
                style={{
                    background: `linear-gradient(135deg, ${currentCompany.primaryColor}, ${currentCompany.secondaryColor})`,
                }}
            >
                <Building2 className="size-5" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span
                    className="mb-0.5 truncate leading-tight font-semibold"
                    style={{ color: currentCompany.primaryColor }}
                >
                    {currentCompany.name}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                    {currentCompany.description}
                </span>
            </div>
        </>
    );
}
