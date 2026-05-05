export interface AccountPayable {
    id: number;
    purchase_id: number;
    installment_number: number;
    due_date: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue';
    paid_at: string | null;
    paid_method: string | null;
    payment_notes: string | null;
}
