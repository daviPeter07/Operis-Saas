export interface AccountReceivable {
    id: number;
    customer_id: number | null;
    sale_id: number | null;
    installment_number: number | null;
    entry_date: string | null;
    due_date: string | null;
    item: string | null;
    description: string | null;
    amount: number;
    status: 'pending' | 'received' | 'overdue' | 'cancelled';
    received_at: string | null;
}
