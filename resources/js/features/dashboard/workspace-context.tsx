import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import {
    defaultWorkspaceNavigation,
    defaultWorkspaceQuickActions,
    defaultWorkspaceRole,
} from '@/constants/workspace';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type {
    WorkspaceModule,
    WorkspaceModuleKey,
    WorkspaceRole,
    WorkspaceState,
    WorkspaceTeamAccessMode,
} from '@/types/workspace';

interface WorkspaceContextValue extends WorkspaceState {
    switchCompany: (companyId: string) => void;
    canAccessSettings: boolean;
    canManageTeam: boolean;
    teamAccessMode: WorkspaceTeamAccessMode;
    isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const restrictedModulesByRole: Partial<
    Record<WorkspaceRole, WorkspaceModuleKey[]>
> = {
    admin: [],
    supervisor: ['settings'],
    user: ['settings'],
};

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const { data: currentUser, isLoading } = useCurrentUser();
    const [state, setState] = useState<WorkspaceState>({
        companies: [],
        currentCompany: {
            id: '',
            name: '',
            slug: '',
            role: defaultWorkspaceRole,
            initials: '',
            description: '',
            primaryColor: '',
            secondaryColor: '',
        },
        navigation: defaultWorkspaceNavigation,
        quickActions: defaultWorkspaceQuickActions,
    });

    useMemo(() => {
        if (isLoading) {
            return;
        }

        const companyId = String(currentUser?.current_company?.id || 1);
        const companyName =
            currentUser?.current_company?.name || 'Minha empresa';
        const initials = companyName
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();

        const company = {
            id: companyId,
            name: companyName,
            slug: 'minha-empresa',
            role: defaultWorkspaceRole,
            initials,
            description: 'Empresa ativa no ambiente atual',
            primaryColor: '#f97316',
            secondaryColor: '#fb923c',
        };

        setState({
            companies: [company],
            currentCompany: company,
            navigation: defaultWorkspaceNavigation,
            quickActions: defaultWorkspaceQuickActions,
        });
    }, [currentUser, isLoading]);

    const switchCompany = useCallback(
        (companyId: string) => {
            const company = state.companies.find((c) => c.id === companyId);

            if (company) {
                setState((prev) => ({ ...prev, currentCompany: company }));
            }
        },
        [state.companies],
    );

    const navigation = useMemo(() => {
        return filterNavigationByRole(
            state.navigation,
            state.currentCompany.role,
        );
    }, [state.currentCompany.role, state.navigation]);

    const canAccessSettings = state.currentCompany.role === 'admin';
    const canManageTeam = state.currentCompany.role === 'admin';
    const teamAccessMode: WorkspaceTeamAccessMode = canManageTeam
        ? 'manage'
        : state.currentCompany.role === 'supervisor'
          ? 'request-admin'
          : 'view';

    return (
        <WorkspaceContext.Provider
            value={{
                ...state,
                navigation,
                switchCompany,
                canAccessSettings,
                canManageTeam,
                teamAccessMode,
                isLoading,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
}

function filterNavigationByRole(
    navigation: WorkspaceModule[],
    role: WorkspaceRole,
): WorkspaceModule[] {
    const restrictedModules = new Set(restrictedModulesByRole[role] ?? []);

    return navigation.filter((item) => !restrictedModules.has(item.key));
}

export function useWorkspace(): WorkspaceContextValue {
    const context = useContext(WorkspaceContext);

    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }

    return context;
}
