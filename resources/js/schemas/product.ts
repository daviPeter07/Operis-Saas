export interface Product {
    id: number;
    name: string;
    sku: string;
    barcode: string | null;
    description: string | null;
    sale_price: number;
    cost: number;
    stock: number;
    min_stock: number;
    status: 'active' | 'inactive';
    category_id: number;
    brand_id: number | null;
}
