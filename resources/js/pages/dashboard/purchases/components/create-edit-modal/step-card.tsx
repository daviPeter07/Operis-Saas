import type { StepCardProps } from '../../utils/types';

export function StepCard({ children }: StepCardProps) {
    return (
        <div className="mx-auto w-full max-w-3xl p-4">
            <div className="divide-y rounded-2xl border bg-card">
                {children}
            </div>
        </div>
    );
}
