export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    document: string;
    status: 'active' | 'inactive';
}

export interface CreateCustomerInput {
    name: string;
    email: string;
    phone?: string;
    document?: string;
}
