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
import { showServerErrors } from '@/utils/form-errors';
import { toFieldOptions } from '@/utils/form-fields';
import {
    CLOSED_QUICK_CREATE,
    SAVE_PRODUCT_ERROR,
    PRODUCT_DIALOG_TEXT,
    QUICK_CREATE_TEXT,
} from '../../utils/constants';
import {
    normalizeInitialData,
    toProductFormValues,
    toProductSubmitData,
} from '../../utils/functions';
import { productFormSchema } from '../../utils/schemas';
import type {
    CreateEditModalProps,
    ProductDialogForm,
    ProductDialogSubmitData,
    QuickCreateState,
    QuickCreateType,
} from '../../utils/types';
import { DescriptionField } from './description-field';
import { IdentificationFields } from './identification-fields';
import { PriceFields } from './price-fields';
import { QuickCreateDialog } from './quick-create-dialog';
import { StockField } from './stock-field';

export function CreateEditModal({
    open,
    onOpenChange,
    product,
    onSubmit,
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
    const form = useForm<ProductDialogForm>({
        resolver: zodResolver(productFormSchema),
        mode: 'onTouched',
        defaultValues: normalizeInitialData(initialData),
    });
    const [quickCreate, setQuickCreate] =
        useState<QuickCreateState>(CLOSED_QUICK_CREATE);
    const text = PRODUCT_DIALOG_TEXT[product ? 'edit' : 'create'];

    useEffect(() => {
        if (open) {
            form.reset(normalizeInitialData(initialData));
        }
    }, [form, initialData, open]);

    const save = async (data: ProductDialogSubmitData) => {
        if (onSubmit) {
            await onSubmit(data);
        } else if (product) {
            await updateProduct.mutateAsync({ ...data, id: product.id });
        } else {
            await createProduct.mutateAsync(data);
        }
    };

    const submit = form.handleSubmit(async (values) => {
        try {
            await save(toProductSubmitData(values));
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
            const brand = await createBrand.mutateAsync({
                name,
                status: 'active',
            });
            form.setValue('brand_id', String(brand.id), {
                shouldValidate: true,
            });
        } else {
            const category = await createCategory.mutateAsync({
                name,
                status: 'active',
            });
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
                className="flex max-h-[calc(100dvh-1rem)] !w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[calc(100dvh-4rem)] sm:!max-w-[980px]"
                onEscapeKeyDown={keepDialogOpenWhileSearchListOpen}
            >
                <DialogHeader className="border-b px-4 py-4 pr-12 text-left sm:px-6">
                    <DialogTitle>{text.title}</DialogTitle>
                    <DialogDescription>{text.description}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={submit}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <div className="grid min-h-0 flex-1 content-start gap-4 overflow-y-auto px-4 py-4 sm:grid-cols-2 sm:px-6 sm:py-5">
                            <IdentificationFields
                                brands={toFieldOptions(brands)}
                                categories={toFieldOptions(categories)}
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

                        <DialogFooter className="flex-row gap-2 border-t px-4 py-3 sm:px-6">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 sm:flex-none"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 sm:flex-none"
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
