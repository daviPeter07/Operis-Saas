import type { ApiResponse } from '@/lib/schemas/base';

export interface ImportPreviewRow {
    row: number;
    data: Record<string, unknown>;
    errors: string[];
    valid: boolean;
}

export interface ImportPreview {
    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    rows: ImportPreviewRow[];
    sample_errors: string[];
}

export interface ImportResult {
    job_id: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    imported_count?: number;
    failed_count?: number;
}

export type ImportEndpoint =
    | 'customers'
    | 'suppliers'
    | 'products'
    | 'brands'
    | 'categories';

class ImportService {
    async preview(
        file: File,
        endpoint: ImportEndpoint,
    ): Promise<ApiResponse<ImportPreview>> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('preview', 'true');

        const response = await fetch(`/api/${endpoint}/import`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        return response.json();
    }

    async execute(
        file: File,
        endpoint: ImportEndpoint,
    ): Promise<ApiResponse<ImportResult>> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/${endpoint}/import`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        return response.json();
    }

    async checkStatus(jobId: string): Promise<ApiResponse<ImportResult>> {
        return fetch(`/api/imports/${jobId}/status`, {
            credentials: 'include',
        }).then((res) => res.json());
    }

    isValidFile(file: File): boolean {
        const validExtensions = ['.csv', '.xls', '.xlsx'];
        const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

        return validExtensions.includes(ext);
    }
}

export const importService = new ImportService();
