export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    document: string;
    status: 'active' | 'inactive';
    credit_enabled: boolean;
    credit_limit: number;
    credit_term_days: number;
    /** Registration date ("YYYY-MM-DD HH:mm:ss"), used by the period filter. */
    createdAt?: string | null;
}

export interface CreateCustomerInput {
    name: string;
    email: string;
    phone?: string;
    document?: string;
    credit_enabled?: boolean;
    credit_limit?: number;
    credit_term_days?: number;
}
