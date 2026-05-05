import { Clock3 } from 'lucide-react';

type ComingSoonOverlayProps = {
    title: string;
    description: string;
    badge?: string;
};

export function ComingSoonOverlay({
    title,
    description,
    badge = 'Funcionalidade em desenvolvimento',
}: ComingSoonOverlayProps) {
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
            <div className="max-w-md rounded-2xl border border-border bg-background/95 px-8 py-7 text-center shadow-lg backdrop-blur-sm">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Clock3 className="size-6" />
                </div>

                <h2 className="text-xl font-semibold text-foreground">
                    {title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                </p>

                <span className="mt-5 inline-flex rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                    {badge}
                </span>
            </div>
        </div>
    );
}
