import { createContext, useContext, useState, useCallback  } from 'react';
import type {ReactNode} from 'react';
import { mockWorkspaceState } from '@/lib/mocks/workspace-mocks';
import type { WorkspaceState } from '@/types/workspace';

interface WorkspaceContextValue extends WorkspaceState {
    switchCompany: (companyId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<WorkspaceState>(mockWorkspaceState);

    const switchCompany = useCallback((companyId: string) => {
        const company = state.companies.find((c) => c.id === companyId);

        if (company) {
            setState((prev) => ({ ...prev, currentCompany: company }));
        }
    }, [state.companies]);

    return (
        <WorkspaceContext.Provider value={{ ...state, switchCompany }}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace(): WorkspaceContextValue {
    const context = useContext(WorkspaceContext);

    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }

    return context;
}