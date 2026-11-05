import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AuthLayout from '@/layouts/auth-layout';
import { QueryProvider } from '@/lib/query-provider';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        if (name.startsWith('auth/')) {
            return AuthLayout;
        }

        return null;
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                <QueryProvider>
                    {app}
                    <Toaster />
                </QueryProvider>
            </TooltipProvider>
        );
    },
    progress: {
        // Shown right away so navigation never feels unresponsive.
        delay: 0,
        color: '#f97316',
    },
});

initializeTheme();
