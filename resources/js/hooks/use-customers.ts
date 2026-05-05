import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services/customers';

export const customersQueryKey = ['customers'] as const;

type CreateCustomerInput = {
    name: string;
    email: string;
    phone: string;
    document: string;
    person_type?: string;
};

export function useCustomers() {
    return useQuery({
        queryKey: customersQueryKey,
        queryFn: async () => {
            const response = await customerService.list();

            return response.data;
        },
    });
}

export function useCreateCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateCustomerInput) =>
            customerService.create({
                name: payload.name,
                email: payload.email,
                phone: payload.phone,
                document: payload.document,
                person_type: payload.person_type || 'pf',
                status: 'active',
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: customersQueryKey });
        },
    });
}

export function useDeleteCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => customerService.delete(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: customersQueryKey });
        },
    });
}
