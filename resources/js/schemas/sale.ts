export interface SaleItem {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    unit_cost: number;
    subtotal: number;
}

export interface Sale {
    id: number;
    customer_id: number | null;
    date: string;
    subtotal: number;
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
    payment_method: string;
    customer_name?: string | null;
    installments?: number;
    first_installment_date?: string | null;
    installment_value?: number | null;
    items?: SaleItem[];
}
