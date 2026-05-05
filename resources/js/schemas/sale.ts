export interface SaleItem {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

export interface Sale {
    id: number;
    customer_id: number;
    date: string;
    subtotal: number;
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
    payment_method: string;
    items?: SaleItem[];
}
