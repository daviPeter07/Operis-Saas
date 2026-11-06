import { cn } from '@/lib/utils';
import { CATALOG_MODES } from '../../utils/constants';
import type { CatalogMode } from '../../utils/types';

type CatalogModeSwitchProps = {
    mode: CatalogMode;
    onChange: (mode: CatalogMode) => void;
};

export function CatalogModeSwitch({ mode, onChange }: CatalogModeSwitchProps) {
    return (
        <div
            role="tablist"
            aria-label="O que adicionar à venda"
            className="inline-flex rounded-lg border bg-muted/50 p-1"
        >
            {CATALOG_MODES.map((option) => {
                const Icon = option.icon;
                const isActive = option.value === mode;

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                            isActive
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <Icon aria-hidden className="size-4" />
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
