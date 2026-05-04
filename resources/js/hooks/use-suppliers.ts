import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supplierService } from '@/services/suppliers';

export const suppliersQueryKey = ['suppliers'] as const;

type CreateSupplierInput = {
    name: string;
    email: string;
    phone: string;
    document: string;
};

export function useSuppliers() {
    return useQuery({
        queryKey: suppliersQueryKey,
        queryFn: async () => {
            const response = await supplierService.list();

            return response.data;
        },
    });
}

export function useCreateSupplier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateSupplierInput) =>
            supplierService.create({
                name: payload.name,
                email: payload.email,
                phone: payload.phone,
                document: payload.document,
                status: 'active',
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: suppliersQueryKey,
            });
        },
    });
}
