import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { keepDialogOpenWhileSearchListOpen } from '@/components/input-search-complete';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useBrands, useCreateBrand } from '@/hooks/use-brands';
import { useCategories, useCreateCategory } from '@/hooks/use-categories';
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-products';
import { toFieldOptions } from '@/utils/form-fields';
import {
    CLOSED_QUICK_CREATE,
    SAVE_PRODUCT_ERROR,
    PRODUCT_DIALOG_TEXT,
    QUICK_CREATE_TEXT,
} from '../../utils/constants';
import {
    normalizeInitialData,
    showServerErrors,
    toProductFormValues,
    toProductSubmitData,
} from '../../utils/functions';
import { productFormSchema } from '../../utils/schemas';
import type {
    CreateEditModalProps,
    ProductDialogForm,
    ProductDialogProps,
    QuickCreateState,
    QuickCreateType,
} from '../../utils/types';
import { DescriptionField } from './description-field';
import { IdentificationFields } from './identification-fields';
import { PriceFields } from './price-fields';
import { QuickCreateDialog } from './quick-create-dialog';
import { StockField } from './stock-field';

export function ProductDialog({
    open,
    onOpenChange,
    mode,
    initialData,
    brands,
    categories,
    onCreateBrand,
    onCreateCategory,
    onSubmit,
}: ProductDialogProps) {
    const form = useForm<ProductDialogForm>({
        resolver: zodResolver(productFormSchema),
        mode: 'onTouched',
        defaultValues: normalizeInitialData(initialData),
    });
    const [quickCreate, setQuickCreate] =
        useState<QuickCreateState>(CLOSED_QUICK_CREATE);
    const text = PRODUCT_DIALOG_TEXT[mode];

    useEffect(() => {
        if (open) {
            form.reset(normalizeInitialData(initialData));
        }
    }, [form, initialData, open]);

    const submit = form.handleSubmit(async (values) => {
        try {
            await onSubmit(toProductSubmitData(values));
            onOpenChange(false);
        } catch (error) {
            showServerErrors(form, error, SAVE_PRODUCT_ERROR);
        }
    });

    const createFromQuickDialog = async (
        type: QuickCreateType,
        name: string,
    ) => {
        if (type === 'brand') {
            const brand = await onCreateBrand(name);
            form.setValue('brand_id', String(brand.id), {
                shouldValidate: true,
            });
        } else {
            const category = await onCreateCategory(name);
            form.setValue('category_id', String(category.id), {
                shouldValidate: true,
            });
        }

        toast.success(QUICK_CREATE_TEXT[type].success);
        setQuickCreate(CLOSED_QUICK_CREATE);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="!w-[calc(100vw-2rem)] sm:!max-w-[980px]"
                onEscapeKeyDown={keepDialogOpenWhileSearchListOpen}
            >
                <DialogHeader>
                    <DialogTitle>{text.title}</DialogTitle>
                    <DialogDescription>{text.description}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <IdentificationFields
                                brands={brands}
                                categories={categories}
                                onQuickCreate={(type, name = '') =>
                                    setQuickCreate({ type, name })
                                }
                            />
                            <PriceFields />
                            <StockField name="stock" label="Estoque inicial" />
                            <StockField
                                name="min_stock"
                                label="Estoque mínimo"
                            />
                            <DescriptionField />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    !form.formState.isValid ||
                                    form.formState.isSubmitting
                                }
                            >
                                {form.formState.isSubmitting
                                    ? 'Salvando...'
                                    : text.submit}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>

                <QuickCreateDialog
                    type={quickCreate.type}
                    initialName={quickCreate.name}
                    onClose={() => setQuickCreate(CLOSED_QUICK_CREATE)}
                    onCreate={createFromQuickDialog}
                />
            </DialogContent>
        </Dialog>
    );
}

export function CreateEditModal({
    open,
    onOpenChange,
    product,
}: CreateEditModalProps) {
    const { data: brands = [] } = useBrands();
    const { data: categories = [] } = useCategories();
    const createBrand = useCreateBrand();
    const createCategory = useCreateCategory();
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const initialData = useMemo(
        () => (product ? toProductFormValues(product) : undefined),
        [product],
    );

    return (
        <ProductDialog
            open={open}
            onOpenChange={onOpenChange}
            mode={product ? 'edit' : 'create'}
            initialData={initialData}
            brands={toFieldOptions(brands)}
            categories={toFieldOptions(categories)}
            onCreateBrand={(name) =>
                createBrand.mutateAsync({ name, status: 'active' })
            }
            onCreateCategory={(name) =>
                createCategory.mutateAsync({ name, status: 'active' })
            }
            onSubmit={async (data) => {
                if (product) {
                    await updateProduct.mutateAsync({
                        ...data,
                        id: product.id,
                    });

                    return;
                }

                await createProduct.mutateAsync(data);
            }}
        />
    );
}
