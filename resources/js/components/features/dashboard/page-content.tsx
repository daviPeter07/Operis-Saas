import { type ReactNode } from 'react';

interface PageContentProps {
    children: ReactNode;
    className?: string;
}

export function PageContent({ children, className = '' }: PageContentProps) {
    return (
        <div
            className={`mt-0 border-t border-border px-6 pt-4 pb-6 ${className}`}
        >
            {children}
        </div>
    );
}
