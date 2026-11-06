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

export type PurchaseHistoryType =
    | 'created'
    | 'updated'
    | 'payment_made'
    | 'completed'
    | 'cancelled';

export interface PurchaseHistoryEntry {
    type: PurchaseHistoryType;
    occurred_at: string;
    description: string;
    amount: number | null;
}

export interface PurchasePayable {
    id: number;
    installment_number: number | null;
    total_installments: number | null;
    due_date: string | null;
    amount: number;
    amount_paid: number;
    status: 'pending' | 'partial' | 'paid' | 'cancelled';
    paid_at: string | null;
}

export interface Purchase {
    id: number;
    supplier_id: number | null;
    supplier_name?: string | null;
    date: string;
    createdAt?: string;
    due_date: string | null;
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
    completed_at?: string | null;
    cancelled_at?: string | null;
    payment_method: string;
    boleto_term_days?: number | null;
    notes?: string | null;
    items?: PurchaseItem[];
    payables?: PurchasePayable[];
    history?: PurchaseHistoryEntry[];
}
