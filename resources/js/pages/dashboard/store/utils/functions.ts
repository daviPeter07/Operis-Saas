import type { Product } from '@/schemas/product';
import { toNumber } from '@/services/normalizers';
import { STORE_PREVIEW_LIMIT } from './constants';
import type { StoreProductCard } from './types';

/** Active products with stock: what the showcase would publish. */
export function toStoreProducts(products: Product[]): StoreProductCard[] {
    return products
        .filter(
            (product) =>
                product.status === 'active' && toNumber(product.stock) > 0,
        )
        .slice(0, STORE_PREVIEW_LIMIT)
        .map((product) => ({
            id: product.id,
            name: product.name,
            price: toNumber(product.sale_price),
            stock: toNumber(product.stock),
            initials: product.name.slice(0, 2).toUpperCase(),
        }));
}
