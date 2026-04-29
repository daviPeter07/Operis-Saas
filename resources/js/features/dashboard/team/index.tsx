import { useWorkspace } from '@/features/dashboard/workspace-context';
import { TeamPageContent } from './team-page-content';

export function TeamModule() {
    const { currentCompany, teamAccessMode } = useWorkspace();

    return (
        <TeamPageContent
            currentRole={currentCompany.role}
            teamAccessMode={teamAccessMode}
            requestAdminHref="/dashboard/team?mode=admin-request"
        />
    );
}

export { AdminRequestPage } from './admin-request-page';
