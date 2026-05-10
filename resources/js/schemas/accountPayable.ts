export interface AccountPayable {
    id: number;
    supplier_id: number | null;
    purchase_id: number | null;
    installment_number: number | null;
    entry_date: string | null;
    item: string | null;
    description: string | null;
    due_date: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    paid_at: string | null;
    paid_method: string | null;
    payment_notes: string | null;
}
