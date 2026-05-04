import { Barcode, PackagePlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCurrencyBR } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { UiProduct as Product } from '@/types/dashboard-entities';

interface CatalogPanelProps {
    productSearch: string;
    setProductSearch: (value: string) => void;
    isScannerReady: boolean;
    onToggleScanner: () => void;
    onOpenCreateProduct: () => void;
    visibleProducts: Product[];
    onAddFromCatalog: (product: Product) => void;
}

export function CatalogPanel({
    productSearch,
    setProductSearch,
    isScannerReady,
    onToggleScanner,
    onOpenCreateProduct,
    visibleProducts,
    onAddFromCatalog,
}: CatalogPanelProps) {
    return (
        <section className="flex min-h-0 flex-col border-r">
            <div className="flex gap-3 border-b p-4">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={productSearch}
                        onChange={(event) =>
                            setProductSearch(event.currentTarget.value)
                        }
                        placeholder="Buscar produto, codigo ou codigo de barras..."
                        className={cn(
                            'pl-9 transition-colors',
                            isScannerReady &&
                                'border-primary bg-primary/5 ring-1 ring-primary/30',
                        )}
                    />
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant={isScannerReady ? 'default' : 'outline'}
                            className="border-primary/40"
                            onClick={onToggleScanner}
                        >
                            <Barcode className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Leitor de codigo de barras</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onOpenCreateProduct}
                        >
                            <PackagePlus className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Criar produto</TooltipContent>
                </Tooltip>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <div className="grid gap-3">
                    {visibleProducts.map((product) => (
                        <button
                            key={product.id}
                            type="button"
                            onClick={() => onAddFromCatalog(product)}
                            className="grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <span className="text-xs font-semibold">
                                    {product.name.slice(0, 2).toUpperCase()}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                    {product.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {product.sku}
                                </p>
                            </div>
                            <span className="text-sm font-semibold">
                                {formatCurrencyBR(product.price)}
                            </span>
                        </button>
                    ))}
                    {visibleProducts.length === 0 && (
                        <p className="py-12 text-center text-sm text-muted-foreground">
                            Nenhum produto encontrado.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
