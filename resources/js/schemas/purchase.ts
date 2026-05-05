export interface PurchaseItem {
    id: number;
    product_id: number;
    quantity: number;
    unit_cost: number;
    subtotal: number;
}

export interface Purchase {
    id: number;
    supplier_id: number;
    date: string;
    due_date: string;
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
    payment_method: string;
    items?: PurchaseItem[];
}
