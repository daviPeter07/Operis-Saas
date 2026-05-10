import { Printer, DollarSign } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import { SalesDialog } from '@/components/sales-dialog/sales-dialog';
import { Button } from '@/components/ui/button';
import { useAccountReceivables } from '@/hooks/use-account-receivables';
import { useBrands, useCreateBrand } from '@/hooks/use-brands';
import { useCategories, useCreateCategory } from '@/hooks/use-categories';
import { useCustomers } from '@/hooks/use-customers';
import { useCreateProduct, useProducts } from '@/hooks/use-products';
import type { SaleMutationInput } from '@/hooks/use-sales';
import {
    useCreateSale,
    useDeleteSale,
    useSales,
    useUpdateSale,
} from '@/hooks/use-sales';
import {
    formatCurrencyBR,
    formatDateBR,
    formatDateTimeBR,
    translatePaymentMethod,
} from '@/lib/format';
import type { Sale } from '@/schemas/sale';
import { saleService } from '@/services/sales';
import type {
    UiCustomer,
    UiPaymentMethod,
    UiProduct,
} from '@/types/dashboard-entities';
import type { SalesRecord as DialogSalesRecord } from '@/types/sales-dialog';
import { calculateSaleProfit } from '@/utils/sale-profit';
import { todayString } from '@/utils/sales-dialog';
import type { Column } from '../generic-table';
import { GenericTable } from '../generic-table';
import { SaleDocumentPreviewDialog } from './sale-document-preview-dialog';
import { SalesHeader } from './sales-header';

type SaleRow = {
    brandNames?: string;
    id: string;
    sale_id: number;
    customer_id: number | null;
    clientName: string;
    productNames: string;
    categoryNames: string;
    total: number;
    profit: number;
    payment_method: string;
    status: string;
    date: string;
    installments?: number;
    installment_number?: number;
};

type SaleMutationPayload = SaleMutationInput;

function hasSameSalesMetricsRows(previous: SaleRow[], next: SaleRow[]): boolean {
    if (previous.length !== next.length) {
        return false;
    }

    for (let index = 0; index < previous.length; index += 1) {
        const prevRow = previous[index];
        const nextRow = next[index];

        if (
            prevRow.id !== nextRow.id ||
            prevRow.status !== nextRow.status ||
            prevRow.total !== nextRow.total ||
            prevRow.profit !== nextRow.profit
        ) {
            return false;
        }
    }

    return true;
}

function toDateOnly(value: string | null | undefined): string {
    if (!value) {
        return '';
    }

    const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);

    return match ? match[1] : value;
}

export function SalesModule() {
    const [isCreateOpen, setIsCreateOpen] = useState(() => {
        const params = new URLSearchParams(window.location.search);

        return params.get('action') === 'create-sale';
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get('action') === 'create-sale') {
            window.history.replaceState({}, '', '/dashboard/sales');
        }
    }, []);

    const { data: sales = [], isPending: isSalesPending } = useSales();
    const { data: receivables = [] } = useAccountReceivables();
    const receivablesBySaleId = useMemo(() => {
        const grouped = new Map<number, typeof receivables>();

        receivables.forEach((receivable) => {
            if (receivable.sale_id == null) {
                return;
            }

            const current = grouped.get(receivable.sale_id) ?? [];
            current.push(receivable);
            grouped.set(receivable.sale_id, current);
        });

        return grouped;
    }, [receivables]);
    const { data: brands = [], isPending: isBrandsPending } = useBrands();
    const { data: categories = [], isPending: isCategoriesPending } =
        useCategories();
    const { data: customers = [], isPending: isCustomersPending } =
        useCustomers();
    const { data: products = [], isPending: isProductsPending } =
        useProducts();
    const createBrand = useCreateBrand();
    const createCategory = useCreateCategory();
    const createProduct = useCreateProduct();
    const createSale = useCreateSale();
    const deleteSale = useDeleteSale();
    const updateSale = useUpdateSale();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editSale, setEditSale] = useState<DialogSalesRecord | null>(null);
    const [previewSale, setPreviewSale] = useState<Sale | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewMode, setPreviewMode] = useState<'digital' | 'thermal'>('digital');

    // Abre o preview térmico ao clicar no ícone de visualização da linha
    const handlePreview = async (row: SaleRow) => {
        const saleId = Number(String(row.id).split('-')[0]);
        const previewStatus: Sale['status'] =
            row.status === 'completed' || row.status === 'cancelled'
                ? row.status
                : 'pending';
        try {
            const sale = await saleService.get(saleId);
            setPreviewMode('thermal');
            setPreviewSale({ ...sale, status: previewStatus });
            setIsPreviewOpen(true);
        } catch {
            toast.error('Erro ao abrir preview termico.');
        }
    };
    const [dialogProducts, setDialogProducts] = useState<UiProduct[]>([]);
    const [filteredRows, setFilteredRows] = useState<SaleRow[]>([]);

    const mappedCustomers = useMemo<UiCustomer[]>(
        () =>
            customers.map((customer) => ({
                id: String(customer.id),
                name: customer.name,
                email: customer.email ?? '',
                phone: customer.phone ?? '',
                document: customer.document ?? '',
                city: '',
                state: '',
                address: '',
                creditEnabled: customer.credit_enabled,
                creditLimit: Number(customer.credit_limit ?? 0),
                creditTermDays: Number(customer.credit_term_days ?? 30),
                availableCredit:
                    Number(customer.credit_limit ?? 0) -
                    receivables
                        .filter(
                            (receivable) =>
                                receivable.customer_id === customer.id &&
                                receivable.status !== 'received',
                        )
                        .reduce(
                            (sum, receivable) => sum + receivable.amount,
                            0,
                        ),
                createdAt: new Date().toISOString().slice(0, 10),
            })),
        [customers, receivables],
    );

    const mappedProducts = useMemo<UiProduct[]>(
        () =>
            products.map((product) => ({
                id: String(product.id),
                name: product.name,
                sku: product.sku,
                barcode: product.barcode ?? undefined,
                category: String(product.category_id ?? ''),
                brand: String(product.brand_id ?? ''),
                price: Number(product.sale_price ?? 0),
                cost: Number(product.cost ?? 0),
                stock: Number(product.stock ?? 0),
                minStock: Number(product.min_stock ?? 0),
                createdAt: new Date().toISOString().slice(0, 10),
            })),
        [products],
    );

    const salesDialogProducts = useMemo(
        () => [...dialogProducts, ...mappedProducts],
        [dialogProducts, mappedProducts],
    );
    const brandOptions = useMemo(
        () =>
            brands.map((brand) => ({
                value: String(brand.id),
                label: brand.name,
            })),
        [brands],
    );

    const brandMap = useMemo(() => new Map(brands.map((b) => [String(b.id), b.name])), [brands]);
    const categoryOptions = useMemo(
        () =>
            categories.map((category) => ({
                value: String(category.id),
                label: category.name,
            })),
        [categories],
    );

    const productById = useMemo(
        () =>
            new Map(
                salesDialogProducts.map((product) => [product.id, product]),
            ),
        [salesDialogProducts],
    );
    const customerNameById = useMemo(
        () =>
            new Map(customers.map((customer) => [customer.id, customer.name])),
        [customers],
    );

    const rows: SaleRow[] = [];
    sales
        .filter((sale) => sale.status !== 'cancelled')
        .forEach((sale) => {
            const productNames = Array.from(
                new Set(
                    (sale.items ?? [])
                        .map((item) => item.product_name?.trim())
                        .filter((value): value is string => Boolean(value)),
                ),
            );
            const categoryNames = Array.from(
                new Set(
                    (sale.items ?? [])
                        .map((item) => item.category_name?.trim())
                        .filter((value): value is string => Boolean(value)),
                ),
            );

            const brandNames = Array.from(
                new Set(
                    (sale.items ?? [])
                        .map((item) => {
                            const prod = productById.get(String(item.product_id));
                            return prod?.brand ? brandMap.get(prod.brand) ?? '' : '';
                        })
                        .filter((value): value is string => Boolean(value)),
                ),
            );

            const clientName =
                sale.customer_id === null
                    ? 'Sem cliente'
                    : customerNameById.get(sale.customer_id) ||
                      `#${sale.customer_id}`;

            const saleReceivables =
                receivablesBySaleId
                    .get(sale.id)
                    ?.slice()
                    .sort((first, second) => {
                        const firstDate = toDateOnly(
                            first.due_date ?? first.entry_date ?? sale.date,
                        );
                        const secondDate = toDateOnly(
                            second.due_date ?? second.entry_date ?? sale.date,
                        );

                        if (firstDate !== secondDate) {
                            return firstDate.localeCompare(secondDate);
                        }

                        return (first.installment_number ?? 0) -
                            (second.installment_number ?? 0);
                    }) ?? [];

            const saleProfit = calculateSaleProfit(sale);

            if (saleReceivables.length > 0) {
                const totalReceivablesAmount =
                    saleReceivables.reduce(
                        (sum, receivable) => sum + Number(receivable.amount ?? 0),
                        0,
                    ) || Number(sale.total);

                saleReceivables.forEach((receivable) => {
                    const amount = Number(receivable.amount ?? 0);
                    const ratio =
                        totalReceivablesAmount > 0
                            ? amount / totalReceivablesAmount
                            : 0;
                    const status =
                        receivable.status === 'received'
                            ? 'completed'
                            : receivable.status;

                    rows.push({
                        id:
                            receivable.installment_number != null
                                ? `${sale.id}-${receivable.installment_number}`
                                : `${sale.id}-entry-${receivable.id}`,
                        sale_id: sale.id,
                        customer_id: sale.customer_id,
                        clientName,
                        productNames: productNames.join(', ') || '-',
                        categoryNames: categoryNames.join(', ') || '-',
                        brandNames: brandNames.join(', ') || '-',
                        total: amount,
                        profit: saleProfit * ratio,
                        status,
                        payment_method: sale.payment_method,
                        date: toDateOnly(
                            receivable.due_date ??
                                receivable.entry_date ??
                                sale.createdAt ??
                                sale.date,
                        ),
                        installments: sale.installments ?? 1,
                        installment_number:
                            receivable.installment_number ?? undefined,
                    });
                });

                return;
            }

            const installments = sale.installments ?? 1;
            const installmentValue = sale.total / installments;
            const baseDate = sale.createdAt ?? sale.date;

            for (let i = 0; i < installments; i++) {
                const installmentDate = new Date(baseDate);
                installmentDate.setMonth(installmentDate.getMonth() + i);

rows.push({
                        id: `${sale.id}-${i + 1}`,
                        sale_id: sale.id,
                        customer_id: sale.customer_id,
                        clientName,
                        productNames: productNames.join(', ') || '-',
                        categoryNames: categoryNames.join(', ') || '-',
                        brandNames: brandNames.join(', ') || '-',
                        total: installmentValue,
                        profit: saleProfit / installments,
                        status: sale.status,
                        payment_method: sale.payment_method,
                        date: installmentDate.toISOString().slice(0, 10),
                        installments,
                        installment_number: i + 1,
                    });
            }
        });

    const handleFilteredDataChange = useCallback((nextRows: SaleRow[]) => {
        setFilteredRows((previous) =>
            hasSameSalesMetricsRows(previous, nextRows) ? previous : nextRows,
        );
    }, []);

    const columns: Column<SaleRow>[] = [
        { key: 'clientName', header: 'Cliente' },
        { key: 'productNames', header: 'Produto' },
        { key: 'categoryNames', header: 'Categoria' },
        { key: 'brandNames', header: 'Marca' },
        {
            key: 'total',
            header: 'Total',
            render: (value: unknown) => formatCurrencyBR(Number(value)),
        },
        {
            key: 'profit',
            header: 'Lucro',
            render: (value: unknown) => formatCurrencyBR(Number(value)),
        },
        {
            key: 'status',
            header: 'Status',
            render: (value: unknown) => <StatusBadge status={String(value)} />,
        },
        {
            key: 'payment_method',
            header: 'Metodo',
            render: (value: unknown) => translatePaymentMethod(String(value)),
        },
        {
            key: 'installment_number',
            header: 'Parcela',
            render: (value: unknown, row: SaleRow) =>
                row.installment_number
                    ? `${row.installment_number}/${row.installments}`
                    : '-',
        },
        {
            key: 'date',
            header: 'Data',
            render: (value: unknown) => formatDateBR(String(value)),
        },

    ];

    const metrics = useMemo(() => {
        const baseRows = filteredRows;
        const salesCount = baseRows.length;
        const salesTotal = baseRows.reduce((sum, sale) => sum + sale.total, 0);
        const profit = baseRows.reduce((sum, sale) => sum + sale.profit, 0);
        const receivable = baseRows
            .filter((sale) => sale.status === 'pending')
            .reduce((sum, sale) => sum + sale.total, 0);

        return {
            salesCount,
            salesTotal,
            profit,
            receivable,
        };
    }, [filteredRows]);

    const handleCreateFromSalesDialog = async (sale: DialogSalesRecord) => {
        const customerId = Number(sale.clientId);
        const items = sale.lineItems
            .map((item: DialogSalesRecord['lineItems'][number]) => ({
                product_id: Number(item.productId),
                quantity: Number(item.quantity),
                unit_price: Number(item.unitPrice),
            }))
            .filter(
                (item) =>
                    Number.isFinite(item.product_id) &&
                    item.product_id > 0 &&
                    Number.isFinite(item.quantity) &&
                    item.quantity > 0 &&
                    Number.isFinite(item.unit_price) &&
                    item.unit_price >= 0,
            );

        if (!Number.isFinite(customerId) || customerId <= 0) {
            throw new Error('Selecione um cliente valido para continuar.');
        }

        if (items.length === 0) {
            throw new Error('Adicione ao menos um item valido na venda.');
        }

        const paymentMethod =
            sale.paymentMethod === 'money'
                ? 'cash'
                : sale.paymentMethod === 'crediario'
                  ? 'crediario'
                  : sale.paymentMethod === 'card'
                    ? sale.cardType === 'credit'
                        ? 'card_credit'
                        : 'card_debit'
                    : 'pix';

        const isCrediario = sale.paymentMethod === 'crediario';
        const isCardCredit = sale.cardType === 'credit';
        const useInstallments = isCrediario || isCardCredit;

        const isAllPaid = isCrediario && (sale.paidInstallments?.length ?? 0) === (sale.installments ?? 1);
        const payload: SaleMutationPayload = {
            customer_id: customerId,
            date: sale.createdAt || todayString(),
            payment_method: paymentMethod as
                | 'cash'
                | 'pix'
                | 'card_debit'
                | 'card_credit'
                | 'crediario',
            status: isAllPaid ? 'completed' : (sale.status === 'completed' ? 'completed' : 'pending'),
            installments: useInstallments ? sale.installments : undefined,
            first_installment_date: useInstallments
                ? sale.firstInstallmentDate
                : undefined,
            installment_value: useInstallments ? sale.installmentValue : undefined,
            crediario_entry:
                sale.paymentMethod === 'crediario'
                    ? Number(sale.crediarioEntry ?? 0)
                    : undefined,
            paid_installments:
                sale.paymentMethod === 'crediario'
                    ? (sale.paidInstallments ?? undefined)
                    : undefined,
            items,
        };

        await createSale.mutateAsync(payload);
        toast.success('Venda criada com sucesso.');
    };

    const handleCreateProduct = async (data: {
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
    }): Promise<UiProduct> => {
        const createdProduct = await createProduct.mutateAsync(data);

        const mappedProduct: UiProduct = {
            id: String(createdProduct.id),
            name: createdProduct.name,
            sku: createdProduct.sku,
            barcode: createdProduct.barcode ?? undefined,
            category: String(createdProduct.category_id ?? ''),
            brand: String(createdProduct.brand_id ?? ''),
            price: Number(createdProduct.sale_price ?? 0),
            cost: Number(createdProduct.cost ?? 0),
            stock: Number(createdProduct.stock ?? 0),
            minStock: Number(createdProduct.min_stock ?? 0),
            createdAt: new Date().toISOString().slice(0, 10),
        };

        setDialogProducts((previous) => [mappedProduct, ...previous]);
        toast.success('Produto criado com sucesso.');

        return mappedProduct;
    };

    return (
        <div className="space-y-5">
            <SalesHeader metrics={metrics} />

            <GenericTable
                data={rows}
                columns={columns}
                title="Vendas"
                loading={
                    isSalesPending ||
                    isCustomersPending ||
                    isProductsPending ||
                    isBrandsPending ||
                    isCategoriesPending
                }
                sortableColumns={[
                    { key: 'clientName', type: 'text' },
                    { key: 'productNames', type: 'text' },
                    { key: 'categoryNames', type: 'text' },
                    { key: 'date', type: 'date' },
                ]}
                dateFilterKey="date"
                onFilteredDataChange={handleFilteredDataChange}
                isCreateOpen={isCreateOpen}
                onCreateOpenChange={setIsCreateOpen}
                onView={handlePreview}
                onDelete={async (row) => {
                    const saleId = Number(String(row.id).split('-')[0]);
                    await deleteSale.mutateAsync(saleId);
                }}
                onEdit={async (row) => {
                    try {
                        const saleId = Number(String(row.id).split('-')[0]);
                        const full = await saleService.get(saleId);
                        const mappedPaymentMethod: UiPaymentMethod =
                            full.payment_method === 'cash'
                                ? 'money'
                                : full.payment_method === 'crediario'
                                ? 'crediario'
                                : full.payment_method === 'pix'
                                ? 'pix'
                                : 'card';

                        const mappedSale: DialogSalesRecord = {
                            id: String(full.id),
                            clientId: String(full.customer_id),
                            clientName: '',
                            createdAt: full.date,
                            lineItems: (full.items ?? []).map((item) => {
                                const product = productById.get(
                                    String(item.product_id),
                                );

                                return {
                                    id: crypto.randomUUID(),
                                    productId: String(item.product_id),
                                    productName:
                                        item.product_name ??
                                        product?.name ??
                                        `#${item.product_id}`,
                                    sku: product?.sku ?? '',
                                    quantity: item.quantity,
                                    unitPrice: item.unit_price,
                                    unitCost:
                                        item.unit_cost ?? product?.cost ?? 0,
                                    subtotal: item.subtotal,
                                };
                            }),
                            paymentMethod: mappedPaymentMethod,
                            total: full.total,
                            cardType:
                                full.payment_method === 'card_credit'
                                    ? 'credit'
                                    : 'debit',
                            installments: full.installments ?? 1,
                            firstInstallmentDate:
                                full.first_installment_date ?? undefined,
                            installmentValue:
                                full.installment_value ?? undefined,
                            crediarioEntry:
                                full.crediario_entry ?? undefined,
                            availableCredit: mappedCustomers.find(
                                (customer) =>
                                    customer.id === String(full.customer_id),
                            )?.availableCredit,
                            status:
                                full.status === 'completed'
                                    ? 'completed'
                                    : full.status === 'cancelled'
                                    ? 'cancelled'
                                    : 'pending',
                        };

                        setEditSale(mappedSale);
                        setIsEditOpen(true);
                    } catch {
                        toast.error('Erro ao carregar a venda para edicao.');
                    }
                }}
                createDialog={({ open, onOpenChange }) => (
                    <SalesDialog
                        open={open}
                        onOpenChange={onOpenChange}
                        onSubmit={(sale) => {
                            void handleCreateFromSalesDialog(sale)
                                .then(() => {
                                    onOpenChange(false);
                                })
                                .catch((error: unknown) => {
                                    const message =
                                        error instanceof Error && error.message
                                            ? error.message
                                            : 'Erro ao criar a venda.';

                                    toast.error(message);
                                });
                        }}
                        clients={mappedCustomers}
                        products={salesDialogProducts}
                        brands={brandOptions}
                        categories={categoryOptions}
                        onCreateProduct={handleCreateProduct}
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
                    />
                )}
            />

            {editSale ? (
                <SalesDialog
                    open={isEditOpen}
                    onOpenChange={(open) => {
                        setIsEditOpen(open);

                        if (!open) {
                            setEditSale(null);
                        }
                    }}
                    onSubmit={async (sale) => {
                        const customerId = Number(sale.clientId);
                        const items = sale.lineItems
                            .map(
                                (
                                    item: DialogSalesRecord['lineItems'][number],
                                ) => ({
                                    product_id: Number(item.productId),
                                    quantity: Number(item.quantity),
                                    unit_price: Number(item.unitPrice),
                                }),
                            )
                            .filter(
                                (item) =>
                                    Number.isFinite(item.product_id) &&
                                    item.product_id > 0 &&
                                    Number.isFinite(item.quantity) &&
                                    item.quantity > 0 &&
                                    Number.isFinite(item.unit_price) &&
                                    item.unit_price >= 0,
                            );

                        if (!Number.isFinite(customerId) || customerId <= 0) {
                            toast.error(
                                'Selecione um cliente valido para continuar.',
                            );

                            return;
                        }

                        if (items.length === 0) {
                            toast.error(
                                'Adicione ao menos um item valido na venda.',
                            );

                            return;
                        }

                        const paymentMethod =
                            sale.paymentMethod === 'money'
                                ? 'cash'
                                : sale.paymentMethod === 'crediario'
                                  ? 'crediario'
                                  : sale.paymentMethod === 'card'
                                    ? sale.cardType === 'credit'
                                        ? 'card_credit'
                                        : 'card_debit'
                                    : 'pix';

                        const isCrediario = sale.paymentMethod === 'crediario';
                        const isCardCredit = sale.cardType === 'credit';
                        const useInstallments = isCrediario || isCardCredit;

                        try {
                            const payload: SaleMutationPayload = {
                                customer_id: customerId,
                                date:
                                    sale.createdAt ||
                                    todayString(),
                                payment_method: paymentMethod as
                                    | 'cash'
                                    | 'pix'
                                    | 'card_debit'
                                    | 'card_credit'
                                    | 'crediario',
                                status:
                                    sale.status === 'completed'
                                        ? 'completed'
                                        : 'pending',
                                installments:
                                    useInstallments
                                        ? sale.installments
                                        : undefined,
                                first_installment_date:
                                    useInstallments
                                        ? sale.firstInstallmentDate
                                        : undefined,
                                installment_value:
                                    useInstallments
                                        ? sale.installmentValue
                                        : undefined,
                                crediario_entry:
                                    isCrediario
                                        ? Number(sale.crediarioEntry ?? 0)
                                        : undefined,
                                items,
                            };

                            await updateSale.mutateAsync({
                                id: Number(editSale.id),
                                data: payload,
                            });

                            toast.success('Venda atualizada com sucesso.');
                            setIsEditOpen(false);
                            setEditSale(null);
                        } catch (error) {
                            const message =
                                error instanceof Error && error.message
                                    ? error.message
                                    : 'Erro ao atualizar a venda.';

                            toast.error(message);
                        }
                    }}
                    clients={mappedCustomers}
                    products={salesDialogProducts}
                    brands={brandOptions}
                    categories={categoryOptions}
                    onCreateProduct={handleCreateProduct}
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
                    sale={editSale}
                />
            ) : null}

            <SaleDocumentPreviewDialog
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                sale={previewSale}
                initialMode={previewMode}
            />
        </div>
    );
}
