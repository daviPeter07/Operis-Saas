import { ComingSoonOverlay } from '@/components/coming-soon-overlay';
import { PageContent } from '@/components/page-content';
import { useProducts } from '@/hooks/use-products';
import AppLayout from '@/layouts/app-layout';
import { StorePreview } from './components/store-preview';
import { STORE_BREADCRUMB, STORE_COMING_SOON } from './utils/constants';
import { toStoreProducts } from './utils/functions';

// Visual preview only: the store module is not built yet.
export default function StorePage() {
    const { data: products = [] } = useProducts();

    return (
        <AppLayout breadcrumbs={[STORE_BREADCRUMB]}>
            <PageContent>
                <div className="relative">
                    <div className="pointer-events-none opacity-40 select-none">
                        <StorePreview products={toStoreProducts(products)} />
                    </div>

                    <ComingSoonOverlay
                        title={STORE_COMING_SOON.title}
                        description={STORE_COMING_SOON.description}
                    />
                </div>
            </PageContent>
        </AppLayout>
    );
}
