export interface Supplier {
    id: number;
    name: string;
    email: string;
    phone: string;
    document: string;
    person_type?: 'pf' | 'pj';
    status: 'active' | 'inactive';
}
