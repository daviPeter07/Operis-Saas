import type { SaleItem } from '@/schemas/sale';

export function isServiceItem(item: SaleItem): boolean {
    return item.type === 'service' || Boolean(item.service_id);
}

/** Product or service name, for tables, receipts and reports. */
export function getSaleItemName(item: SaleItem): string {
    const name =
        item.name ??
        (isServiceItem(item) ? item.service_name : item.product_name);

    if (name?.trim()) {
        return name.trim();
    }

    return isServiceItem(item)
        ? `Serviço #${item.service_id}`
        : `Produto #${item.product_id}`;
}
