import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services/customers';

export const customersQueryKey = ['customers'] as const;

type CreateCustomerInput = {
    name: string;
    email: string;
    phone: string;
    document: string;
    person_type?: string;
    credit_enabled?: boolean;
    credit_limit?: number;
    credit_term_days?: number;
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
                status: 'active',
                credit_enabled: payload.credit_enabled ?? false,
                credit_limit: payload.credit_limit ?? 0,
                credit_term_days: payload.credit_term_days ?? 30,
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: customersQueryKey,
            });
        },
    });
}

export function useUpdateCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number;
            data: CreateCustomerInput & { status?: 'active' | 'inactive' };
        }) =>
            customerService.update(id, {
                name: data.name,
                email: data.email,
                phone: data.phone,
                document: data.document,
                status: data.status,
                credit_enabled: data.credit_enabled ?? false,
                credit_limit: data.credit_limit ?? 0,
                credit_term_days: data.credit_term_days ?? 30,
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: customersQueryKey,
            });
        },
    });
}

export function useDeleteCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => customerService.delete(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: customersQueryKey,
            });
        },
    });
}
