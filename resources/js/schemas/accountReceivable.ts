export interface AccountReceivable {
    id: number;
    sale_id: number;
    installment_number: number;
    due_date: string;
    amount: number;
    status: 'pending' | 'received' | 'overdue';
    received_at: string | null;
}
