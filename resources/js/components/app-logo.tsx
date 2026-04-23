import AppLogoIcon from '@/components/app-logo-icon';
import { useWorkspace } from '@/components/features/dashboard/workspace-context';

export default function AppLogo() {
    const { currentCompany } = useWorkspace();

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-accent">
                    {currentCompany.name}
                </span>
            </div>
        </>
    );
}
