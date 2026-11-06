import { ExternalLink, Package, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/components/workspace-context';
import { formatCurrencyBR } from '@/lib/format';
import { STORE_PREVIEW_KPIS } from '../../utils/constants';
import type { StoreProductCard } from '../../utils/types';

type StorePreviewProps = {
    products: StoreProductCard[];
};

export function StorePreview({ products }: StorePreviewProps) {
    const { currentCompany } = useWorkspace();
    const companyName = currentCompany.name || 'Sua loja';

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                        <Store className="size-6" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold">{companyName}</p>
                        <p className="text-sm text-muted-foreground">
                            Loja online · vitrine sincronizada com o estoque
                        </p>
                    </div>
                </div>
                <Button variant="outline" tabIndex={-1}>
                    <ExternalLink className="size-4" />
                    Ver loja
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {STORE_PREVIEW_KPIS.map((kpi) => (
                    <div
                        key={kpi.label}
                        className="flex items-center justify-between rounded-xl border p-4"
                    >
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {kpi.label}
                            </p>
                            <p className="text-2xl font-semibold">
                                {kpi.value}
                            </p>
                        </div>
                        <kpi.icon className="size-5 text-accent" />
                    </div>
                ))}
            </div>

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Vitrine</h2>
                    <p className="text-sm text-muted-foreground">
                        Produtos do estoque publicados na loja
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {(products.length > 0
                        ? products
                        : PLACEHOLDER_PRODUCTS
                    ).map((product) => (
                        <div
                            key={product.id}
                            className="overflow-hidden rounded-xl border"
                        >
                            <div className="flex aspect-[4/3] items-center justify-center bg-muted text-lg font-semibold text-muted-foreground">
                                {product.initials || (
                                    <Package className="size-6" />
                                )}
                            </div>
                            <div className="space-y-1 p-3">
                                <p className="line-clamp-2 text-sm font-medium">
                                    {product.name}
                                </p>
                                <p className="font-semibold text-accent">
                                    {formatCurrencyBR(product.price)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {product.stock} em estoque
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

const PLACEHOLDER_PRODUCTS: StoreProductCard[] = Array.from(
    { length: 4 },
    (_, index) => ({
        id: -index - 1,
        name: 'Produto do estoque',
        price: 0,
        stock: 0,
        initials: '',
    }),
);
