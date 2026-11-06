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
import { useDeleteSupplier } from '@/hooks/use-suppliers';
import AppLayout from '@/layouts/app-layout';
import { SupplierCreateDialog } from './components/create-edit-modal';
import { SupplierDetails } from './components/supplier-details';
import {
    DELETE_SUPPLIER_DIALOG,
    DELETE_SUPPLIER_ERROR,
    DELETE_SUPPLIER_SUCCESS,
    SUPPLIERS_LIST_URL,
} from './utils/constants';
import {
    getShowBreadcrumbs,
    goBackToSuppliers,
    useSupplier,
} from './utils/functions';
import type { SuppliersShowPageProps } from './utils/types';

export default function SuppliersShowPage({
    supplierId,
}: SuppliersShowPageProps) {
    return (
        <AppLayout breadcrumbs={getShowBreadcrumbs(supplierId)}>
            <PageContent>
                <ShowContent key={supplierId} supplierId={supplierId} />
            </PageContent>
        </AppLayout>
    );
}

function ShowContent({ supplierId }: SuppliersShowPageProps) {
    const { data: supplier, isPending, isError } = useSupplier(supplierId);
    const deleteSupplier = useDeleteSupplier();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const backButton = (
        <DetailsBackButton
            label="Voltar para fornecedores"
            onClick={goBackToSuppliers}
        />
    );

    if (isPending) {
        return (
            <div className="space-y-6">
                {backButton}
                <Skeleton className="h-8 w-72" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
        );
    }

    if (isError || !supplier) {
        return (
            <div className="space-y-6">
                {backButton}
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
                    <UserX className="size-10 text-muted-foreground" />
                    <p className="text-lg font-semibold">
                        Fornecedor não encontrado
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Ele pode ter sido excluído ou pertencer a outra empresa.
                        Volte para a lista e escolha outro fornecedor.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {backButton}

            <DetailsHeader
                title={`Detalhes do ${supplier.name}`}
                status={<StatusChip active={supplier.status === 'active'} />}
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

            <SupplierDetails supplier={supplier} />

            <SupplierCreateDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                supplier={supplier}
            />

            <DeleteConfirmDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                {...DELETE_SUPPLIER_DIALOG}
                itemName={supplier.name}
                onConfirm={async () => {
                    try {
                        await deleteSupplier.mutateAsync(supplier.id);
                        toast.success(DELETE_SUPPLIER_SUCCESS);
                        router.visit(SUPPLIERS_LIST_URL);
                    } catch (error) {
                        toast.error(
                            (error as { message?: string } | null)?.message ||
                                DELETE_SUPPLIER_ERROR,
                        );
                    }
                }}
            />
        </div>
    );
}
