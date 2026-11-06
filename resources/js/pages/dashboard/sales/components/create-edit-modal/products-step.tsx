import { CatalogPanel } from '@/components/sales-dialog/catalog-panel';
import { filterProductsByQuery } from '../../utils/functions';
import type { ProductsStepProps } from '../../utils/types';
import { CartAddedNotice } from './cart-added-notice';

export function ProductsStep({
    form,
    products,
    lastAdded,
    onAddFromCatalog,
    onOpenCreateProduct,
    onViewCart,
    onDismissAdded,
}: ProductsStepProps) {
    return (
        <div className="flex min-h-0 flex-1 flex-col">
            {lastAdded && form.lineItems.length > 0 ? (
                <div className="px-4 pt-4">
                    <CartAddedNotice
                        key={lastAdded.id}
                        added={lastAdded}
                        itemCount={form.lineItems.length}
                        total={form.total}
                        onViewCart={onViewCart}
                        onDismiss={onDismissAdded}
                    />
                </div>
            ) : null}
            <CatalogPanel
                productSearch={form.productSearch}
                setProductSearch={form.setProductSearch}
                isScannerReady={form.isScannerReady}
                onToggleScanner={form.toggleScanner}
                onOpenCreateProduct={onOpenCreateProduct}
                visibleProducts={filterProductsByQuery(
                    products,
                    form.productSearch,
                )}
                onAddFromCatalog={onAddFromCatalog}
            />
        </div>
    );
}
