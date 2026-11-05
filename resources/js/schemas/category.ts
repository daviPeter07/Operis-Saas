export interface Category {
    id: number;
    name: string;
    status: 'active' | 'inactive';
    /** Registration date ("YYYY-MM-DD HH:mm:ss"), used by the period filter. */
    createdAt?: string | null;
}
