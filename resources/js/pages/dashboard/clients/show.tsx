import { router } from '@inertiajs/react';
import { Pencil, Trash2, UserX } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    DetailsBackButton,
    DetailsHeader,
    StatusChip,
} from '@/components/details-page';
import { PageContent } from '@/components/page-content';
import { DeleteConfirmDialog } from '@/components/table/delete-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteCustomer } from '@/hooks/use-customers';
import AppLayout from '@/layouts/app-layout';
import { ClientDetails } from './components/client-details';
import { CreateEditModal } from './components/create-edit-modal';
import { CLIENTS_LIST_URL, DELETE_CLIENT_DIALOG } from './utils/constants';
import {
    getShowBreadcrumbs,
    goBackToClients,
    useCustomer,
} from './utils/functions';
import type { ClientsShowPageProps } from './utils/types';

export default function ClientsShowPage({ customerId }: ClientsShowPageProps) {
    return (
        <AppLayout breadcrumbs={getShowBreadcrumbs(customerId)}>
            <PageContent>
                <ShowContent key={customerId} customerId={customerId} />
            </PageContent>
        </AppLayout>
    );
}

function ShowContent({ customerId }: ClientsShowPageProps) {
    const { data: customer, isPending, isError } = useCustomer(customerId);
    const deleteCustomer = useDeleteCustomer();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const backButton = (
        <DetailsBackButton
            label="Voltar para os clientes"
            onClick={goBackToClients}
        />
    );

    if (isPending) {
        return (
            <div className="space-y-6">
                {backButton}
                <Skeleton className="h-8 w-72" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
        );
    }

    if (isError || !customer) {
        return (
            <div className="space-y-6">
                {backButton}
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
                    <UserX className="size-10 text-muted-foreground" />
                    <p className="text-lg font-semibold">
                        Cliente não encontrado
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Ele pode ter sido excluído ou pertencer a outra empresa.
                        Volte para os clientes e escolha outro.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {backButton}

            <DetailsHeader
                title={`Detalhes do ${customer.name}`}
                status={<StatusChip active={customer.status === 'active'} />}
                actions={
                    <>
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => setIsEditOpen(true)}
                        >
                            <Pencil className="size-4" />
                            Editar
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2 text-red-600 hover:text-red-700 dark:text-red-400"
                            onClick={() => setIsDeleteOpen(true)}
                        >
                            <Trash2 className="size-4" />
                            Excluir
                        </Button>
                    </>
                }
            />

            <ClientDetails customer={customer} />

            <CreateEditModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                customer={customer}
            />

            <DeleteConfirmDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                {...DELETE_CLIENT_DIALOG}
                itemName={customer.name}
                onConfirm={async () => {
                    try {
                        await deleteCustomer.mutateAsync(customer.id);
                        toast.success('Cliente excluído com sucesso.');
                        router.visit(CLIENTS_LIST_URL);
                    } catch (error) {
                        toast.error(
                            (error as { message?: string } | null)?.message ||
                                'Não foi possível excluir o cliente.',
                        );
                    }
                }}
            />
        </div>
    );
}
