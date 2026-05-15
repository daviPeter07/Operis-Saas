export interface AccountReceivable {
    id: number;
    customer_id: number | null;
    sale_id: number | null;
    installment_number: number | null;
    total_installments: number | null;
    entry_date: string | null;
    due_date: string | null;
    item: string | null;
    description: string | null;
    amount: number;
    amount_paid: number;
    remaining_balance: number;
    status: 'pending' | 'partial' | 'received' | 'overdue' | 'cancelled';
    received_at: string | null;
}
