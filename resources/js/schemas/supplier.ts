export interface Supplier {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    document: string | null;
    person_type: 'pf' | 'pj';
    status: 'active' | 'inactive';
}
