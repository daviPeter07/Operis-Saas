import { AlertTriangle, Boxes, DollarSign } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useBrands, useCreateBrand } from '@/hooks/use-brands';
import { useCategories, useCreateCategory } from '@/hooks/use-categories';
import {
    useCreateProduct,
    useDeleteProduct,
    useProducts,
    useUpdateProduct,
} from '@/hooks/use-products';
import { formatCurrencyBR, formatQuantityWithUnit } from '@/lib/format';
import { cn } from '@/lib/utils';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { ProductDialog } from './product-dialog';

type ProductRow = {
    id: string;
    name: string;
    sku: string;
    barcode: string | null;
    description: string | null;
    cost: number;
    sale_price: number;
    stock: number;
    min_stock: number;
    category_id: number;
    brand_id: number | null;
    status: 'active' | 'inactive';
};

export function InventoryModule() {
    const { data: products = [] } = useProducts();
    const { data: brands = [] } = useBrands();
    const { data: categories = [] } = useCategories();
    const createProduct = useCreateProduct();
    const createBrand = useCreateBrand();
    const createCategory = useCreateCategory();
    const updateProduct = useUpdateProduct();
    const deleteProduct = useDeleteProduct();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(
        null,
    );

    const rows: ProductRow[] = products
        .filter((product) => product.status === 'active')
        .map((product) => ({
            id: String(product.id),
            name: product.name,
            sku: product.sku,
            barcode: product.barcode,
            description: product.description,
            cost: product.cost,
            sale_price: product.sale_price,
            stock: product.stock,
            min_stock: product.min_stock,
            category_id: product.category_id,
            brand_id: product.brand_id,
            status: product.status,
        }));

    const categoryNameById = useMemo(
        () =>
            new Map(categories.map((category) => [category.id, category.name])),
        [categories],
    );

    const brandNameById = useMemo(
        () => new Map(brands.map((brand) => [brand.id, brand.name])),
        [brands],
    );

    const brandOptions = useMemo(
        () =>
            brands.map((brand) => ({
                value: String(brand.id),
                label: brand.name,
            })),
        [brands],
    );

    const categoryOptions = useMemo(
        () =>
            categories.map((category) => ({
                value: String(category.id),
                label: category.name,
            })),
        [categories],
    );

    const columns: Column<ProductRow>[] = [
        { key: 'name', header: 'Produto' },
        { key: 'sku', header: 'Código' },
        {
            key: 'barcode',
            header: 'Código de barras',
            render: (value: unknown) => String(value || 'Sem código'),
        },
        {
            key: 'brand_id',
            header: 'Marca',
            render: (value: unknown) =>
                brandNameById.get(Number(value)) || 'Sem marca',
        },
        {
            key: 'category_id',
            header: 'Categoria',
            render: (value: unknown) =>
                categoryNameById.get(Number(value)) || '-',
        },
        {
            key: 'cost',
            header: 'Preço de custo',
            render: (value: unknown) => formatCurrencyBR(Number(value || 0)),
        },
        {
            key: 'sale_price',
            header: 'Preço de venda',
            render: (value: unknown) => formatCurrencyBR(Number(value || 0)),
        },
        {
            key: 'stock',
            header: 'Estoque',
            render: (value: unknown) => formatQuantityWithUnit(Number(value)),
        },
        {
            key: 'min_stock',
            header: 'Estoque mínimo',
            render: (value: unknown) => formatQuantityWithUnit(Number(value)),
        },
    ];

    const filterFields = [
        { key: 'name', label: 'Produto', type: 'text' as const },
        {
            key: 'category_id',
            label: 'Categoria',
            type: 'select' as const,
            options: categoryOptions,
        },
        {
            key: 'brand_id',
            label: 'Marca',
            type: 'select' as const,
            options: brandOptions,
        },
    ];

    const metrics = useMemo(() => {
        const totalCostValue = rows.reduce(
            (sum, product) => sum + product.cost * product.stock,
            0,
        );
        const totalSaleValue = rows.reduce(
            (sum, product) => sum + product.sale_price * product.stock,
            0,
        );
        const totalStock = rows.reduce((sum, product) => sum + product.stock, 0);
        const lowStockProducts = rows.filter(
            (product) =>
                product.stock <= product.min_stock || product.stock <= 0,
        ).length;

        return [
            {
                key: 'totalCostValue',
                label: 'Valor total em custo',
                value: formatCurrencyBR(totalCostValue),
                icon: DollarSign,
            },
            {
                key: 'totalSaleValue',
                label: 'Valor total em venda',
                value: formatCurrencyBR(totalSaleValue),
                icon: DollarSign,
            },
            {
                key: 'totalStock',
                label: 'Quantidade total em estoque',
                value: formatQuantityWithUnit(totalStock),
                icon: Boxes,
            },
            {
                key: 'lowStockProducts',
                label: 'Produtos com baixo estoque',
                value: String(lowStockProducts),
                icon: AlertTriangle,
            },
        ];
    }, [rows]);

    return (
        <>
            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => {
                    const Icon = metric.icon;

                    return (
                        <Card
                            key={metric.key}
                            className={cn(
                                'overflow-hidden border-border bg-card shadow-sm',
                                'transition-shadow hover:shadow-md',
                            )}
                        >
                            <CardContent className="flex items-center justify-between gap-4 px-5 py-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {metric.label}
                                    </p>
                                    <p className="text-2xl leading-none font-black tracking-tight text-foreground">
                                        {metric.value}
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/15 text-orange-500 ring-1 ring-orange-500/25">
                                    <Icon className="h-6 w-6" />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            <GenericTable
                data={rows}
                columns={columns}
                title="Estoque"
                filterFields={filterFields}
                isCreateOpen={isCreateOpen}
                onCreateOpenChange={setIsCreateOpen}
                createDialog={({ open, onOpenChange }) => (
                    <ProductDialog
                        open={open}
                        onOpenChange={onOpenChange}
                        mode="create"
                        brands={brandOptions}
                        categories={categoryOptions}
                        onCreateBrand={async (name) =>
                            createBrand.mutateAsync({
                                name: name.trim(),
                                status: 'active',
                            })
                        }
                        onCreateCategory={async (name) =>
                            createCategory.mutateAsync({
                                name: name.trim(),
                                status: 'active',
                            })
                        }
                        onSubmit={async (data) => {
                            await createProduct.mutateAsync({
                                name: data.name,
                                sku: data.sku,
                                barcode: data.barcode,
                                description: data.description,
                                sale_price: data.sale_price,
                                cost: data.cost,
                                stock: data.stock,
                                min_stock: data.min_stock,
                                category_id: data.category_id,
                                brand_id: data.brand_id,
                            });
                        }}
                    />
                )}
                onEdit={(row) => {
                    setSelectedProduct(row);
                    setIsEditOpen(true);
                }}
                onDelete={async (row) => {
                    await deleteProduct.mutateAsync(Number(row.id));
                }}
            />

            {selectedProduct ? (
                <ProductDialog
                    open={isEditOpen}
                    onOpenChange={(open) => {
                        setIsEditOpen(open);

                        if (!open) {
                            setSelectedProduct(null);
                        }
                    }}
                    mode="edit"
                    initialData={{
                        id: Number(selectedProduct.id),
                        name: selectedProduct.name,
                        sku: selectedProduct.sku,
                        barcode: selectedProduct.barcode ?? '',
                        description: selectedProduct.description ?? '',
                        cost: formatCurrencyBR(selectedProduct.cost),
                        sale_price: formatCurrencyBR(
                            selectedProduct.sale_price,
                        ),
                        stock: String(selectedProduct.stock),
                        min_stock: String(selectedProduct.min_stock),
                        category_id: String(selectedProduct.category_id),
                        brand_id: selectedProduct.brand_id
                            ? String(selectedProduct.brand_id)
                            : '',
                    }}
                    brands={brandOptions}
                    categories={categoryOptions}
                    onCreateBrand={async (name) =>
                        createBrand.mutateAsync({
                            name: name.trim(),
                            status: 'active',
                        })
                    }
                    onCreateCategory={async (name) =>
                        createCategory.mutateAsync({
                            name: name.trim(),
                            status: 'active',
                        })
                    }
                    onSubmit={async (data) => {
                        await updateProduct.mutateAsync({
                            id: Number(selectedProduct.id),
                            name: data.name,
                            sku: data.sku,
                            barcode: data.barcode,
                            description: data.description,
                            sale_price: data.sale_price,
                            cost: data.cost,
                            stock: data.stock,
                            min_stock: data.min_stock,
                            category_id: data.category_id,
                            brand_id: data.brand_id,
                        });
                    }}
                />
            ) : null}
        </>
    );
}
