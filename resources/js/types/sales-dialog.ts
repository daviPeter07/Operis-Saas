export type SalesLineItem = {
    id: string;
    /** A product moves stock; a service does not. */
    kind: 'product' | 'service';
    productId: string;
    serviceId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    unitCost: number;
    subtotal: number;
};
