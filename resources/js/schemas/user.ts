export interface User {
    id: number;
    name: string;
    email: string;
    current_company_id: number;
    current_company?: {
        id: number;
        name: string;
        verified_at: string | null;
    };
}

export interface LoginResponse {
    token: string;
    expiresAt: string;
    user: User;
}
