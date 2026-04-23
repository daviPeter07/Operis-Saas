import { EmptyState } from '../empty-state';
import { Settings } from 'lucide-react';

interface SettingsModuleProps {}

export function SettingsModule() {
    return (
        <EmptyState
            icon={Settings}
            title="No settings yet"
            description="Settings configuration will appear here."
        />
    );
}
