import { Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspace } from '@/features/dashboard/workspace-context';

export default function AppLogo() {
    const { currentCompany, isLoading } = useWorkspace();

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <Skeleton className="size-9 rounded-xl" />
                <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
        );
    }

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
