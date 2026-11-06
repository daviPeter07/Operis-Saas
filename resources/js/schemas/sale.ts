export interface SaleItem {
    id: number;
    type?: 'product' | 'service';
    /** Product or service name. */
    name?: string | null;
    product_id: number | null;
    product_name?: string | null;
    service_id?: number | null;
    service_name?: string | null;
    category_name?: string | null;
    brand_name?: string | null;
    quantity: number;
    unit_price: number;
    unit_cost: number;
    subtotal: number;
}

export type SaleHistoryType =
    | 'created'
    | 'updated'
    | 'payment_received'
    | 'completed'
    | 'cancelled'
    | 'delivered';

export interface SaleHistoryEntry {
    type: SaleHistoryType;
    occurred_at: string;
    description: string;
    amount: number | null;
}

export interface Sale {
    id: number;
    customer_id: number | null;
    date: string;
    createdAt?: string;
    subtotal: number;
    discount?: number;
    total: number;
    profit?: number;
    // Still to be received: open balance of the pending/partial receivables.
    open_amount?: number;
    status: 'pending' | 'completed' | 'cancelled';
    payment_method: string;
    customer_name?: string | null;
    installments?: number;
    first_installment_date?: string | null;
    installment_value?: number | null;
    crediario_entry?: number | null;
    completed_at?: string | null;
    cancelled_at?: string | null;
    delivered_at?: string | null;
    notes?: string | null;
    items?: SaleItem[];
    history?: SaleHistoryEntry[];
}
