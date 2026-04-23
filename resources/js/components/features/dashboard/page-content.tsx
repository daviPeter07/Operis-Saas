import { type ReactNode } from 'react';

interface PageContentProps {
    children: ReactNode;
    className?: string;
}

export function PageContent({ children, className = '' }: PageContentProps) {
    return (
        <div className={`px-6 pb-6 ${className}`}>
            {children}
        </div>
    );
}