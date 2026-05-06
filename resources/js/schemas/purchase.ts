export interface PurchaseItem {
    id: number;
    product_id: number;
    product_name?: string | null;
    category_name?: string | null;
    brand_name?: string | null;
    quantity: number;
    unit_cost: number;
    subtotal: number;
}

export interface Purchase {
    id: number;
    supplier_id: number;
    date: string;
    due_date: string | null;
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
    payment_method: string;
    boleto_term_days?: number | null;
    items?: PurchaseItem[];
}
