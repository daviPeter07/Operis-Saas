import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/products';

export const productsQueryKey = ['products'] as const;

type CreateProductInput = {
    name: string;
    sku: string;
    barcode: string | null;
    description: string | null;
    sale_price: number;
    cost: number;
    stock: number;
    min_stock: number;
    category_id: number;
    brand_id: number | null;
};

export function useProducts() {
    return useQuery({
        queryKey: productsQueryKey,
        queryFn: async () => {
            const response = await productService.list();

            return response.data;
        },
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateProductInput) =>
            productService.create({
                ...payload,
                status: 'active',
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: productsQueryKey });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => productService.delete(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: productsQueryKey });
        },
    });
}
