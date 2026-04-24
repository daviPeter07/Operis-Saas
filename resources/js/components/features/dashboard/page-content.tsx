import { type ReactNode } from 'react';

interface PageContentProps {
    children: ReactNode;
    className?: string;
}

export function PageContent({ children, className = '' }: PageContentProps) {
    return (
        <div className={`px-6 pb-6 pt-4 border-t border-border mt-0 ${className}`}>
            {children}
        </div>
    );
}