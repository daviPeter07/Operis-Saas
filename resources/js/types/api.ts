export interface Sale {
    id: string;
    clientName: string;
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
    paymentMethod: 'money' | 'credit' | 'debit' | 'pix' | 'installment';
    createdAt: string;
    items?: number;
    profit?: number;
}

export interface Purchase {
    id: string;
    supplierName: string;
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
    paymentMethod: 'money' | 'credit' | 'debit' | 'pix';
    items: number;
    createdAt: string;
}

export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    document: string;
    city: string;
    state: string;
    createdAt: string;
}

export interface Brand {
    id: string;
    name: string;
    description: string;
}

export interface Category {
    id: string;
    name: string;
    description: string;
}

export interface Supplier {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    createdAt: string;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    brand: string;
    category: string;
    price: number;
    minStock: number;
    stock: number;
    createdAt: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}