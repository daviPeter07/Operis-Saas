import { Plus, Search, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCurrencyBR } from '@/lib/format';
import { formatPerformedCount } from '../../utils/functions';
import type { ServiceCatalogPanelProps } from '../../utils/types';

export function ServiceCatalogPanel({
    search,
    onSearchChange,
    services,
    onAdd,
    onOpenCreate,
}: ServiceCatalogPanelProps) {
    return (
        <section className="flex min-h-0 flex-col">
            <div className="flex gap-3 border-b p-4">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) =>
                            onSearchChange(event.currentTarget.value)
                        }
                        placeholder="Buscar serviço pelo nome ou descrição..."
                        className="pl-9"
                    />
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            aria-label="Criar serviço"
                            onClick={onOpenCreate}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Criar serviço</TooltipContent>
                </Tooltip>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <div className="grid gap-3">
                    {services.map((service) => (
                        <button
                            key={service.id}
                            type="button"
                            onClick={() => onAdd(service)}
                            className="grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <Wrench aria-hidden className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                    {service.name}
                                </p>
                                {service.description ? (
                                    <p className="line-clamp-2 text-xs text-muted-foreground">
                                        {service.description}
                                    </p>
                                ) : null}
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-primary">
                                    {formatCurrencyBR(service.price)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatPerformedCount(
                                        service.performed_count,
                                    )}
                                </p>
                            </div>
                        </button>
                    ))}
                    {services.length === 0 && (
                        <div className="flex flex-col items-center gap-3 py-12 text-center text-sm text-muted-foreground">
                            <p>
                                {search.trim()
                                    ? 'Nenhum serviço encontrado.'
                                    : 'Nenhum serviço ativo cadastrado.'}
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onOpenCreate}
                            >
                                <Plus className="h-4 w-4" />
                                Criar serviço
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
