export interface Supplier {
    id: number;
    name: string;
    email: string;
    phone: string;
    document: string;
    status: 'active' | 'inactive';
}
