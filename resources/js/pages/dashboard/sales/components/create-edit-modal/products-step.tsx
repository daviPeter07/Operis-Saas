import { CatalogPanel } from '@/components/sales-dialog/catalog-panel';
import { filterProductsByQuery } from '../../utils/functions';
import type { ProductsStepProps } from '../../utils/types';

export function ProductsStep({
    form,
    products,
    onAddFromCatalog,
    onOpenCreateProduct,
}: ProductsStepProps) {
    return (
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
    );
}
