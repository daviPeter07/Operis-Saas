import { router } from '@inertiajs/react';
import { PackageX, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DetailsBackButton, DetailsHeader } from '@/components/details-page';
import { PageContent } from '@/components/page-content';
import { DeleteConfirmDialog } from '@/components/table/delete-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBrands } from '@/hooks/use-brands';
import { useCategories } from '@/hooks/use-categories';
import { useDeleteProduct } from '@/hooks/use-products';
import AppLayout from '@/layouts/app-layout';
import { CreateEditModal } from './components/create-edit-modal';
import { ProductDetails } from './components/product-details';
import { DELETE_PRODUCT_DIALOG, INVENTORY_LIST_URL } from './utils/constants';
import {
    getShowBreadcrumbs,
    goBackToInventory,
    useProduct,
} from './utils/functions';
import type { InventoryShowPageProps } from './utils/types';

export default function InventoryShowPage({
    productId,
}: InventoryShowPageProps) {
    return (
        <AppLayout breadcrumbs={getShowBreadcrumbs(productId)}>
            <PageContent>
                <ShowContent key={productId} productId={productId} />
            </PageContent>
        </AppLayout>
    );
}

function ShowContent({ productId }: InventoryShowPageProps) {
    const { data: product, isPending, isError } = useProduct(productId);
    const { data: brands = [] } = useBrands();
    const { data: categories = [] } = useCategories();
    const deleteProduct = useDeleteProduct();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const backButton = (
        <DetailsBackButton
            label="Voltar para o estoque"
            onClick={goBackToInventory}
        />
    );

    if (isPending) {
        return (
            <div className="space-y-6">
                {backButton}
                <Skeleton className="h-8 w-72" />
                <Skeleton className="h-48" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="space-y-6">
                {backButton}
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
                    <PackageX className="size-10 text-muted-foreground" />
                    <p className="text-lg font-semibold">
                        Produto não encontrado
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Ele pode ter sido excluído ou pertencer a outra empresa.
                        Volte para o estoque e escolha outro produto.
                    </p>
                </div>
            </div>
        );
    }

    const brandName =
        brands.find((brand) => brand.id === product.brand_id)?.name ??
        'Sem marca';
    const categoryName =
        categories.find((category) => category.id === product.category_id)
            ?.name ?? '-';

    return (
        <div className="space-y-6">
            {backButton}

            <DetailsHeader
                title={`Detalhes do ${product.name}`}
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

            <ProductDetails
                product={product}
                brandName={brandName}
                categoryName={categoryName}
            />

            <CreateEditModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                product={product}
            />

            <DeleteConfirmDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                {...DELETE_PRODUCT_DIALOG}
                itemName={product.name}
                onConfirm={async () => {
                    try {
                        await deleteProduct.mutateAsync(product.id);
                        toast.success('Produto excluído com sucesso.');
                        router.visit(INVENTORY_LIST_URL);
                    } catch (error) {
                        toast.error(
                            (error as { message?: string } | null)?.message ||
                                'Não foi possível excluir o produto.',
                        );
                    }
                }}
            />
        </div>
    );
}
