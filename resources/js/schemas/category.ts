export interface Category {
    id: number;
    name: string;
    status: 'active' | 'inactive';
    /** Active products linked to it; only sent by the table listing. */
    products_count?: number;
    /** Registration date ("YYYY-MM-DD HH:mm:ss"), used by the period filter. */
    createdAt?: string | null;
}
