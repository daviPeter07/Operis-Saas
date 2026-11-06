export interface Service {
    id: number;
    name: string;
    description: string | null;
    price: number;
    /** What the company pays for it (outsourced work); null when done in-house. */
    cost: number | null;
    status: 'active' | 'inactive';
    /** Times it was sold (quantities added up), cancelled sales excluded. */
    performed_count: number;
    /** Registration date ("YYYY-MM-DD HH:mm:ss"), used by the period filter. */
    createdAt?: string | null;
}

export type ServicePayload = {
    name: string;
    description: string | null;
    price: number;
    cost: number | null;
    status?: Service['status'];
};
