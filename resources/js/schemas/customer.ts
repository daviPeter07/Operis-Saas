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
