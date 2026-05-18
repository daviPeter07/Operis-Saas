import * as React from 'react';
import { ReportSummaryCards } from '@/components/table/report-summary-cards';
import { ReportTable } from '@/components/table/report-table';
import type { ReportColumn } from '@/components/table/report-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAccountReceivables } from '@/hooks/use-account-receivables';
import { useBrands } from '@/hooks/use-brands';
import { useCategories } from '@/hooks/use-categories';
import { useCustomers } from '@/hooks/use-customers';
import { useProducts } from '@/hooks/use-products';
import { usePurchases } from '@/hooks/use-purchases';
import { useSales } from '@/hooks/use-sales';
import { exportToExcelWithColumns, formatCurrency } from '@/lib/export-excel';
import { exportToPDF } from '@/lib/export-pdf';
import { formatDateBR, translatePaymentMethod } from '@/lib/format';

type Row = Record<string, unknown>;
type ReportViewModel = {
    rows: Row[];
    columns: ReportColumn<Row>[];
    summary: Array<{ title: string; value: string }>;
};

export interface ReportPageProps {
    slug: string;
}

const reportTitles: Record<string, string> = {
    vendas: 'Relatório de Vendas',
    'produtos-mais-vendidos': 'Produtos Mais Vendidos',
    'vendas-categoria': 'Vendas por Categoria',
    'vendas-marca': 'Vendas por Marca',
    'estoque-atual': 'Estoque Atual',
    'estoque-marca': 'Estoque por Marca',
    'pagamentos-metodo': 'Pagamentos por Método',
    inadimplencia: 'Inadimplência',
    'maiores-compradores': 'Maiores Compradores',
    'comprador-especifico': 'Comprador Específico',
};

function formatNumber(value: number): string {
    return value.toLocaleString('pt-BR');
}

function inDateRange(
    date: string | undefined,
    start?: string,
    end?: string,
): boolean {
    if (!date) {
        return false;
    }

    const base = date.slice(0, 10);

    if (start && base < start) {
        return false;
    }

    if (end && base > end) {
        return false;
    }

    return true;
}

export function ReportPage({ slug }: ReportPageProps) {
    const { data: sales = [] } = useSales();
    const { data: purchases = [] } = usePurchases();
    const { data: products = [] } = useProducts();
    const { data: customers = [] } = useCustomers();
    const { data: categories = [] } = useCategories();
    const { data: brands = [] } = useBrands();
    const { data: receivables = [] } = useAccountReceivables();

    const initialQueryParams = React.useMemo(
        () => new URLSearchParams(window.location.search),
        [],
    );
    const [startDate, setStartDate] = React.useState(
        initialQueryParams.get('start_date') ?? '',
    );
    const [endDate, setEndDate] = React.useState(
        initialQueryParams.get('end_date') ?? '',
    );
    const [buyerQuery, setBuyerQuery] = React.useState(
        initialQueryParams.get('buyer') ?? '',
    );

    const productById = React.useMemo(
        () => new Map(products.map((item) => [item.id, item])),
        [products],
    );
    const customerById = React.useMemo(
        () => new Map(customers.map((item) => [item.id, item])),
        [customers],
    );
    const categoryById = React.useMemo(
        () => new Map(categories.map((item) => [item.id, item.name])),
        [categories],
    );
    const brandById = React.useMemo(
        () => new Map(brands.map((item) => [item.id, item.name])),
        [brands],
    );

    const filteredSales = React.useMemo(
        () =>
            sales.filter((sale) =>
                inDateRange(
                    sale.date,
                    startDate || undefined,
                    endDate || undefined,
                ),
            ),
        [sales, startDate, endDate],
    );

    const filteredPurchases = React.useMemo(
        () =>
            purchases.filter((purchase) =>
                inDateRange(
                    purchase.date,
                    startDate || undefined,
                    endDate || undefined,
                ),
            ),
        [purchases, startDate, endDate],
    );

    const report = React.useMemo<ReportViewModel>(() => {
        if (slug === 'vendas') {
            const rows = filteredSales.flatMap((sale) =>
                (sale.items ?? []).map((item) => ({
                    date: formatDateBR(sale.date),
                    client:
                        customerById.get(sale.customer_id ?? -1)?.name ??
                        'Sem cliente',
                    product:
                        item.product_name ??
                        productById.get(item.product_id)?.name ??
                        '-',
                    quantity: item.quantity,
                    unitPrice: item.unit_price,
                    total: item.subtotal,
                })),
            );
            const total = rows.reduce((sum, row) => sum + Number(row.total), 0);
            const qtySales = filteredSales.length;
            const highest = Math.max(
                0,
                ...filteredSales.map((sale) => sale.total),
            );

            return {
                rows,
                columns: [
                    { key: 'date', header: 'Data' },
                    { key: 'client', header: 'Cliente' },
                    { key: 'product', header: 'Produto' },
                    { key: 'quantity', header: 'Quantidade' },
                    {
                        key: 'unitPrice',
                        header: 'Preço Unitário',
                        render: (item: Row) =>
                            formatCurrency(Number(item.unitPrice ?? 0)),
                    },
                    {
                        key: 'total',
                        header: 'Total',
                        render: (item: Row) =>
                            formatCurrency(Number(item.total ?? 0)),
                    },
                ] as ReportColumn<Row>[],
                summary: [
                    { title: 'Total de Vendas', value: formatCurrency(total) },
                    {
                        title: 'Quantidade de Vendas',
                        value: formatNumber(qtySales),
                    },
                    {
                        title: 'Ticket Médio',
                        value: formatCurrency(
                            qtySales > 0 ? total / qtySales : 0,
                        ),
                    },
                    { title: 'Maior Venda', value: formatCurrency(highest) },
                ],
            };
        }

        if (slug === 'produtos-mais-vendidos') {
            const map = new Map<
                string,
                { product: string; quantity: number; revenue: number }
            >();
            filteredSales.forEach((sale) => {
                (sale.items ?? []).forEach((item) => {
                    const product =
                        item.product_name ??
                        productById.get(item.product_id)?.name ??
                        `#${item.product_id}`;
                    const current = map.get(product) ?? {
                        product,
                        quantity: 0,
                        revenue: 0,
                    };
                    current.quantity += item.quantity;
                    current.revenue += item.subtotal;
                    map.set(product, current);
                });
            });
            const rows = [...map.values()].sort(
                (a, b) => b.quantity - a.quantity,
            );
            const totalQty = rows.reduce((sum, row) => sum + row.quantity, 0);
            const totalRevenue = rows.reduce(
                (sum, row) => sum + row.revenue,
                0,
            );

            return {
                rows,
                columns: [
                    { key: 'product', header: 'Produto' },
                    { key: 'quantity', header: 'Quantidade Vendida' },
                    {
                        key: 'revenue',
                        header: 'Receita',
                        render: (item: Row) =>
                            formatCurrency(Number(item.revenue ?? 0)),
                    },
                ] as ReportColumn<Row>[],
                summary: [
                    {
                        title: 'Total Produtos Vendidos',
                        value: formatNumber(totalQty),
                    },
                    {
                        title: 'Receita Total',
                        value: formatCurrency(totalRevenue),
                    },
                    {
                        title: 'Produto Mais Vendido',
                        value: rows[0]?.product ?? '-',
                    },
                    {
                        title: 'Média por Produto',
                        value: formatCurrency(
                            rows.length ? totalRevenue / rows.length : 0,
                        ),
                    },
                ],
            };
        }

        if (slug === 'vendas-categoria' || slug === 'vendas-marca') {
            const rows = filteredSales.flatMap((sale) =>
                (sale.items ?? []).map((item) => {
                    const product = productById.get(item.product_id);
                    const category =
                        item.category_name ??
                        categoryById.get(product?.category_id ?? -1) ??
                        '-';
                    const brand = brandById.get(product?.brand_id ?? -1) ?? '-';

                    return {
                        group: slug === 'vendas-categoria' ? category : brand,
                        product: item.product_name ?? product?.name ?? '-',
                        quantity: item.quantity,
                        unitPrice: item.unit_price,
                        total: item.subtotal,
                    };
                }),
            );
            rows.sort((a, b) => {
                const groupCompare = a.group.localeCompare(b.group);

                if (groupCompare !== 0) {
                    return groupCompare;
                }

                return a.product.localeCompare(b.product);
            });
            const total = rows.reduce((sum, row) => sum + row.total, 0);
            const totalItems = rows.reduce((sum, row) => sum + row.quantity, 0);
            const grouped = new Map<string, number>();
            rows.forEach((row) =>
                grouped.set(
                    row.group,
                    (grouped.get(row.group) ?? 0) + row.total,
                ),
            );
            const topGroup =
                [...grouped.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
                '-';

            return {
                rows,
                columns: [
                    {
                        key: 'group',
                        header:
                            slug === 'vendas-categoria' ? 'Categoria' : 'Marca',
                    },
                    { key: 'product', header: 'Produto' },
                    { key: 'quantity', header: 'Quantidade' },
                    {
                        key: 'unitPrice',
                        header: 'Valor Unitário',
                        render: (item: Row) =>
                            formatCurrency(Number(item.unitPrice ?? 0)),
                    },
                    {
                        key: 'total',
                        header: 'Total',
                        render: (item: Row) =>
                            formatCurrency(Number(item.total ?? 0)),
                    },
                ] as ReportColumn<Row>[],
                summary: [
                    {
                        title:
                            slug === 'vendas-categoria'
                                ? 'Total Categorias'
                                : 'Total Marcas',
                        value: formatNumber(grouped.size),
                    },
                    { title: 'Receita Total', value: formatCurrency(total) },
                    {
                        title:
                            slug === 'vendas-categoria'
                                ? 'Categoria Top'
                                : 'Marca Top',
                        value: topGroup,
                    },
                    {
                        title: 'Quantidade de Itens',
                        value: formatNumber(totalItems),
                    },
                ],
            };
        }

        if (slug === 'estoque-atual') {
            const rows = products.map((product) => ({
                sku: product.sku,
                product: product.name,
                quantity: product.stock,
                minStock: product.min_stock,
                price: product.sale_price,
            }));
            const stockTotal = rows.reduce((sum, row) => sum + row.quantity, 0);
            const stockValue = rows.reduce(
                (sum, row) => sum + row.quantity * row.price,
                0,
            );
            const belowMin = rows.filter(
                (row) => row.quantity < row.minStock,
            ).length;

            return {
                rows,
                columns: [
                    { key: 'sku', header: 'SKU' },
                    { key: 'product', header: 'Produto' },
                    { key: 'quantity', header: 'Quantidade' },
                    { key: 'minStock', header: 'Mínimo' },
                    {
                        key: 'price',
                        header: 'Preço',
                        render: (item: Row) =>
                            formatCurrency(Number(item.price ?? 0)),
                    },
                ] as ReportColumn<Row>[],
                summary: [
                    {
                        title: 'Total de Produtos',
                        value: formatNumber(rows.length),
                    },
                    { title: 'Estoque Total', value: formatNumber(stockTotal) },
                    {
                        title: 'Valor em Estoque',
                        value: formatCurrency(stockValue),
                    },
                    {
                        title: 'Abaixo do Mínimo',
                        value: formatNumber(belowMin),
                    },
                ],
            };
        }

        if (slug === 'estoque-marca') {
            const grouped = new Map<
                string,
                {
                    brand: string;
                    products: number;
                    stock: number;
                    value: number;
                }
            >();
            products.forEach((product) => {
                const brand =
                    brandById.get(product.brand_id ?? -1) ?? 'Sem marca';
                const current = grouped.get(brand) ?? {
                    brand,
                    products: 0,
                    stock: 0,
                    value: 0,
                };
                current.products += 1;
                current.stock += product.stock;
                current.value += product.stock * product.sale_price;
                grouped.set(brand, current);
            });
            const rows = [...grouped.values()];
            const topBrand =
                [...rows].sort((a, b) => b.stock - a.stock)[0]?.brand ?? '-';

            return {
                rows,
                columns: [
                    { key: 'brand', header: 'Marca' },
                    { key: 'products', header: 'Qtd Produtos' },
                    { key: 'stock', header: 'Estoque Total' },
                    {
                        key: 'value',
                        header: 'Valor em Estoque',
                        render: (item: Row) =>
                            formatCurrency(Number(item.value ?? 0)),
                    },
                ] as ReportColumn<Row>[],
                summary: [
                    {
                        title: 'Total de Marcas',
                        value: formatNumber(rows.length),
                    },
                    {
                        title: 'Estoque Total',
                        value: formatNumber(
                            rows.reduce((sum, row) => sum + row.stock, 0),
                        ),
                    },
                    {
                        title: 'Valor em Estoque',
                        value: formatCurrency(
                            rows.reduce((sum, row) => sum + row.value, 0),
                        ),
                    },
                    { title: 'Marca com Mais Estoque', value: topBrand },
                ],
            };
        }

        if (slug === 'pagamentos-metodo') {
            const grouped = new Map<
                string,
                { method: string; transactions: number; total: number }
            >();
            [...filteredSales, ...filteredPurchases].forEach((entry) => {
                const method = translatePaymentMethod(entry.payment_method);
                const current = grouped.get(method) ?? {
                    method,
                    transactions: 0,
                    total: 0,
                };
                current.transactions += 1;
                current.total += entry.total;
                grouped.set(method, current);
            });
            const rows = [...grouped.values()];
            const totalTransactions = rows.reduce(
                (sum, row) => sum + row.transactions,
                0,
            );
            const totalValue = rows.reduce((sum, row) => sum + row.total, 0);

            return {
                rows,
                columns: [
                    { key: 'method', header: 'Método' },
                    { key: 'transactions', header: 'Transações' },
                    {
                        key: 'total',
                        header: 'Valor Total',
                        render: (item: Row) =>
                            formatCurrency(Number(item.total ?? 0)),
                    },
                ] as ReportColumn<Row>[],
                summary: [
                    {
                        title: 'Total Transações',
                        value: formatNumber(totalTransactions),
                    },
                    { title: 'Valor Total', value: formatCurrency(totalValue) },
                    {
                        title: 'Método Mais Usado',
                        value:
                            [...rows].sort(
                                (a, b) => b.transactions - a.transactions,
                            )[0]?.method ?? '-',
                    },
                    {
                        title: 'Ticket Médio',
                        value: formatCurrency(
                            totalTransactions
                                ? totalValue / totalTransactions
                                : 0,
                        ),
                    },
                ],
            };
        }

        if (slug === 'inadimplencia') {
            const today = new Date().toISOString().slice(0, 10);
            const rows = receivables
                .filter(
                    (item) =>
                        item.status === 'pending' &&
                        (item.due_date ?? '') < today,
                )
                .map((item) => ({
                    client:
                        customers.find(
                            (customer) => customer.id === item.customer_id,
                        )?.name ?? 'Sem cliente',
                    invoice: item.sale_id ? `Venda #${item.sale_id}` : 'Manual',
                    dueDate: item.due_date ? formatDateBR(item.due_date) : '-',
                    value: item.amount,
                    status: item.status,
                }));
            const total = rows.reduce((sum, row) => sum + Number(row.value), 0);

            return {
                rows,
                columns: [
                    { key: 'client', header: 'Cliente' },
                    { key: 'invoice', header: 'Fatura' },
                    { key: 'dueDate', header: 'Vencimento' },
                    {
                        key: 'value',
                        header: 'Valor',
                        render: (item: Row) =>
                            formatCurrency(Number(item.value ?? 0)),
                    },
                    { key: 'status', header: 'Status' },
                ] as ReportColumn<Row>[],
                summary: [
                    {
                        title: 'Títulos em Atraso',
                        value: formatNumber(rows.length),
                    },
                    { title: 'Valor em Atraso', value: formatCurrency(total) },
                    {
                        title: 'Cliente com Mais Atraso',
                        value:
                            [...rows].sort(
                                (a, b) => Number(b.value) - Number(a.value),
                            )[0]?.client ?? '-',
                    },
                    {
                        title: 'Título Mais Antigo',
                        value:
                            [...rows].sort((a, b) =>
                                String(a.dueDate).localeCompare(
                                    String(b.dueDate),
                                ),
                            )[0]?.dueDate ?? '-',
                    },
                ],
            };
        }

        if (slug === 'maiores-compradores' || slug === 'comprador-especifico') {
            const spendByCustomer = new Map<
                number,
                { total: number; purchases: number; lastDate: string }
            >();
            filteredSales.forEach((sale) => {
                if (!sale.customer_id) {
                    return;
                }

                const current = spendByCustomer.get(sale.customer_id) ?? {
                    total: 0,
                    purchases: 0,
                    lastDate: sale.date,
                };
                current.total += sale.total;
                current.purchases += 1;

                if (sale.date > current.lastDate) {
                    current.lastDate = sale.date;
                }

                spendByCustomer.set(sale.customer_id, current);
            });

            if (slug === 'maiores-compradores') {
                const rows = [...spendByCustomer.entries()].map(
                    ([customerId, value]) => ({
                        client:
                            customerById.get(customerId)?.name ??
                            `Cliente #${customerId}`,
                        email: customerById.get(customerId)?.email ?? '-',
                        purchases: value.purchases,
                        totalSpent: value.total,
                    }),
                );
                const total = rows.reduce(
                    (sum, row) => sum + row.totalSpent,
                    0,
                );

                return {
                    rows,
                    columns: [
                        { key: 'client', header: 'Cliente' },
                        { key: 'email', header: 'Email' },
                        { key: 'purchases', header: 'Compras' },
                        {
                            key: 'totalSpent',
                            header: 'Total Gasto',
                            render: (item: Row) =>
                                formatCurrency(Number(item.totalSpent ?? 0)),
                        },
                    ] as ReportColumn<Row>[],
                    summary: [
                        {
                            title: 'Clientes com Compras',
                            value: formatNumber(rows.length),
                        },
                        {
                            title: 'Receita Total',
                            value: formatCurrency(total),
                        },
                        {
                            title: 'Maior Comprador',
                            value:
                                [...rows].sort(
                                    (a, b) => b.totalSpent - a.totalSpent,
                                )[0]?.client ?? '-',
                        },
                        {
                            title: 'Média por Cliente',
                            value: formatCurrency(
                                rows.length ? total / rows.length : 0,
                            ),
                        },
                    ],
                };
            }

            const selectedCustomer = customers.find((customer) =>
                customer.name.toLowerCase().includes(buyerQuery.toLowerCase()),
            );
            const rows = selectedCustomer
                ? filteredSales
                      .filter(
                          (sale) => sale.customer_id === selectedCustomer.id,
                      )
                      .flatMap((sale) =>
                          (sale.items ?? []).map((item) => ({
                              date: formatDateBR(sale.date),
                              products:
                                  item.product_name ??
                                  productById.get(item.product_id)?.name ??
                                  '-',
                              quantity: item.quantity,
                              value: item.subtotal,
                              method: translatePaymentMethod(
                                  sale.payment_method,
                              ),
                              status: sale.status,
                          })),
                      )
                : [];
            const selectedStats = selectedCustomer
                ? spendByCustomer.get(selectedCustomer.id)
                : null;
            const lastPurchase = selectedStats?.lastDate
                ? formatDateBR(selectedStats.lastDate)
                : '-';

            return {
                rows,
                columns: [
                    { key: 'date', header: 'Data' },
                    { key: 'products', header: 'Produtos' },
                    { key: 'quantity', header: 'Quantidade' },
                    {
                        key: 'value',
                        header: 'Valor',
                        render: (item: Row) =>
                            formatCurrency(Number(item.value ?? 0)),
                    },
                    { key: 'method', header: 'Método' },
                    { key: 'status', header: 'Status' },
                ] as ReportColumn<Row>[],
                summary: selectedCustomer
                    ? [
                          { title: 'Comprador', value: selectedCustomer.name },
                          {
                              title: 'Total Gasto',
                              value: formatCurrency(selectedStats?.total ?? 0),
                          },
                          {
                              title: 'Qtd Compras',
                              value: formatNumber(
                                  selectedStats?.purchases ?? 0,
                              ),
                          },
                          {
                              title: 'Ticket Médio',
                              value: formatCurrency(
                                  (selectedStats?.purchases ?? 0) > 0
                                      ? (selectedStats?.total ?? 0) /
                                            (selectedStats?.purchases ?? 1)
                                      : 0,
                              ),
                          },
                          { title: 'Última Compra', value: lastPurchase },
                      ]
                    : [],
            };
        }

        return {
            rows: [],
            columns: [] as ReportColumn<Row>[],
            summary: [] as Array<{ title: string; value: string }>,
        };
    }, [
        slug,
        filteredSales,
        filteredPurchases,
        products,
        receivables,
        customers,
        buyerQuery,
        customerById,
        productById,
        categoryById,
        brandById,
    ]);

    const title = reportTitles[slug] ?? 'Relatório';

    const handleApplyDateFilter = () => {
        const params = new URLSearchParams(window.location.search);

        if (startDate) {
            params.set('start_date', startDate);
        } else {
            params.delete('start_date');
        }

        if (endDate) {
            params.set('end_date', endDate);
        } else {
            params.delete('end_date');
        }

        if (slug === 'comprador-especifico' && buyerQuery) {
            params.set('buyer', buyerQuery);
        }

        const query = params.toString();
        window.history.replaceState(
            {},
            '',
            `${window.location.pathname}${query ? `?${query}` : ''}`,
        );
    };

    const exportSummary = report.summary.map((item) => ({
        label: item.title,
        value: item.value,
    }));

    return (
        <div className="space-y-4">
            <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-4">
                <div className="space-y-1">
                    <Label htmlFor="report-start-date">Data inicial</Label>
                    <Input
                        id="report-start-date"
                        type="date"
                        value={startDate}
                        onChange={(event) =>
                            setStartDate(event.currentTarget.value)
                        }
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="report-end-date">Data final</Label>
                    <Input
                        id="report-end-date"
                        type="date"
                        value={endDate}
                        onChange={(event) =>
                            setEndDate(event.currentTarget.value)
                        }
                    />
                </div>
                {slug === 'comprador-especifico' ? (
                    <div className="space-y-1 md:col-span-2">
                        <Label htmlFor="report-buyer">Comprador</Label>
                        <Input
                            id="report-buyer"
                            value={buyerQuery}
                            onChange={(event) =>
                                setBuyerQuery(event.currentTarget.value)
                            }
                            placeholder="Digite o nome do comprador"
                        />
                    </div>
                ) : null}
                <div className="md:col-span-4">
                    <button
                        type="button"
                        onClick={handleApplyDateFilter}
                        className="inline-flex h-9 items-center rounded-md bg-orange-500 px-4 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        Aplicar filtros
                    </button>
                </div>
            </div>

            <ReportSummaryCards cards={report.summary} />

            <ReportTable
                data={report.rows}
                columns={report.columns}
                title={title}
                onExportExcel={() =>
                    exportToExcelWithColumns(
                        report.rows,
                        report.columns.map((col) => ({
                            key: String(col.key),
                            header: col.header,
                        })),
                        {
                            fileName: title,
                            title,
                            summary: exportSummary,
                        },
                    )
                }
                onExportPDF={() =>
                    exportToPDF(
                        report.rows,
                        report.columns.map((col) => ({
                            key: String(col.key),
                            header: col.header,
                        })),
                        { fileName: title, title, summary: exportSummary },
                    )
                }
            />
        </div>
    );
}
