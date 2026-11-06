import { CatalogPanel } from '@/components/sales-dialog/catalog-panel';
import {
    filterProductsByQuery,
    filterServicesByQuery,
} from '../../utils/functions';
import type { ProductsStepProps } from '../../utils/types';
import { CartAddedNotice } from './cart-added-notice';
import { CatalogModeSwitch } from './catalog-mode-switch';
import { ServiceCatalogPanel } from './service-catalog-panel';

export function ProductsStep({
    form,
    products,
    services,
    mode,
    onModeChange,
    serviceSearch,
    onServiceSearchChange,
    lastAdded,
    onAddFromCatalog,
    onAddService,
    onOpenCreateProduct,
    onOpenCreateService,
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
            <div className="px-4 pt-4">
                <CatalogModeSwitch mode={mode} onChange={onModeChange} />
            </div>
            {mode === 'products' ? (
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
            ) : (
                <ServiceCatalogPanel
                    search={serviceSearch}
                    onSearchChange={onServiceSearchChange}
                    services={filterServicesByQuery(services, serviceSearch)}
                    onAdd={onAddService}
                    onOpenCreate={onOpenCreateService}
                />
            )}
        </div>
    );
}
