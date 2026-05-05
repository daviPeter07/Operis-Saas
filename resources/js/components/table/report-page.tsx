import * as React from 'react';
import { ReportTable } from '@/components/table/report-table';
import type { ReportColumn } from '@/components/table/report-table';
import { useAccountPayables } from '@/hooks/use-account-payables';
import { useAccountReceivables } from '@/hooks/use-account-receivables';
import { useCustomers } from '@/hooks/use-customers';
import { useProducts } from '@/hooks/use-products';
import { usePurchases } from '@/hooks/use-purchases';
import { useSales } from '@/hooks/use-sales';
import { exportToExcel } from '@/lib/export-excel';
import { exportToPDF } from '@/lib/export-pdf';

export interface ReportPageProps {
    slug: string;
}

const reportTitles: Record<string, string> = {
    vendas: 'Relatório de Vendas',
    'produtos-mais-vendidos': 'Top Produtos',
    'vendas-categoria': 'Vendas por Categoria',
    'vendas-marca': 'Vendas por Marca',
    'estoque-atual': 'Estoque',
    'contas-receber': 'Contas a Receber',
    'contas-pagar': 'Contas a Pagar',
    'pagamentos-metodo': 'Pagamentos por Método',
    'maiores-compradores': 'Maiores Compradores',
    'clientes-cidade': 'Clientes por Cidade',
    inadimplencia: 'Inadimplência',
};

export function ReportPage({ slug }: ReportPageProps) {
    const { data: sales = [] } = useSales();
    const { data: purchases = [] } = usePurchases();
    const { data: products = [] } = useProducts();
    const { data: customers = [] } = useCustomers();
    const { data: receivables = [] } = useAccountReceivables();
    const { data: payables = [] } = useAccountPayables();

    const data = React.useMemo(() => {
        if (slug === 'vendas') {
            return sales.map((sale) => ({
                date: sale.date,
                client: `Cliente #${sale.customer_id}`,
                product: sale.items?.[0]?.product_id ? `Produto #${sale.items[0].product_id}` : '-',
                quantity: sale.items?.[0]?.quantity ?? 0,
                unitPrice: sale.items?.[0]?.unit_price ?? 0,
                total: sale.total,
            }));
        }

        if (slug === 'produtos-mais-vendidos') {
            const soldByProduct = new Map<number, { qty: number; revenue: number }>();

            for (const sale of sales) {
                for (const item of sale.items ?? []) {
                    const current = soldByProduct.get(item.product_id) ?? {
                        qty: 0,
                        revenue: 0,
                    };
                    soldByProduct.set(item.product_id, {
                        qty: current.qty + item.quantity,
                        revenue: current.revenue + item.subtotal,
                    });
                }
            }

            return [...soldByProduct.entries()].map(([productId, value]) => ({
                product: products.find((p) => p.id === productId)?.name ?? `Produto #${productId}`,
                quantitySold: value.qty,
                revenue: value.revenue,
            }));
        }

        if (slug === 'estoque-atual') {
            return products.map((product) => ({
                sku: product.sku,
                product: product.name,
                currentStock: product.stock,
                minStock: product.min_stock,
                salePrice: product.sale_price,
            }));
        }

        if (slug === 'contas-receber' || slug === 'inadimplencia') {
            const base = receivables.map((receivable) => ({
                client: `Cliente #${receivable.sale_id}`,
                invoice: `Venda #${receivable.sale_id}`,
                dueDate: receivable.due_date,
                value: receivable.amount,
                status: receivable.status,
            }));

            return slug === 'inadimplencia'
                ? base.filter((item) => item.status === 'overdue')
                : base;
        }

        if (slug === 'contas-pagar') {
            return payables.map((payable) => ({
                supplier: `Compra #${payable.purchase_id}`,
                invoice: `Compra #${payable.purchase_id}`,
                dueDate: payable.due_date,
                value: payable.amount,
                status: payable.status,
            }));
        }

        if (slug === 'pagamentos-metodo') {
            const grouped = new Map<string, { transactions: number; totalAmount: number }>();

            for (const sale of sales) {
                const key = sale.payment_method;
                const current = grouped.get(key) ?? { transactions: 0, totalAmount: 0 };
                grouped.set(key, {
                    transactions: current.transactions + 1,
                    totalAmount: current.totalAmount + sale.total,
                });
            }

            for (const purchase of purchases) {
                const key = purchase.payment_method;
                const current = grouped.get(key) ?? { transactions: 0, totalAmount: 0 };
                grouped.set(key, {
                    transactions: current.transactions + 1,
                    totalAmount: current.totalAmount + purchase.total,
                });
            }

            return [...grouped.entries()].map(([paymentMethod, values]) => ({
                paymentMethod,
                transactions: values.transactions,
                totalAmount: values.totalAmount,
            }));
        }

        if (slug === 'maiores-compradores') {
            const spendByCustomer = new Map<number, number>();

            for (const sale of sales) {
                spendByCustomer.set(
                    sale.customer_id,
                    (spendByCustomer.get(sale.customer_id) ?? 0) + sale.total,
                );
            }

            return [...spendByCustomer.entries()].map(([customerId, totalSpent]) => {
                const customer = customers.find((c) => c.id === customerId);

                return {
                    client: customer?.name ?? `Cliente #${customerId}`,
                    email: customer?.email ?? '-',
                    totalPurchases: sales.filter((sale) => sale.customer_id === customerId).length,
                    totalSpent,
                };
            });
        }

        if (slug === 'clientes-cidade') {
            const grouped = new Map<string, { city: string; state: string; clientCount: number }>();

            for (const customer of customers) {
                const key = `${customer.name}-${customer.document}`;
                grouped.set(key, {
                    city: '-',
                    state: '-',
                    clientCount: 1,
                });
            }

            return [...grouped.values()].map((value) => ({
                city: value.city,
                state: value.state,
                clientCount: value.clientCount,
                totalSpent: 0,
            }));
        }

        return [];
    }, [slug, sales, purchases, products, customers, receivables, payables]);

    const columns = React.useMemo<ReportColumn<Record<string, unknown>>[]>(() => {
        const columnMap: Record<string, ReportColumn<Record<string, unknown>>[]> = {
            vendas: [
                { key: 'date', header: 'Data' },
                { key: 'client', header: 'Cliente' },
                { key: 'product', header: 'Produto' },
                { key: 'quantity', header: 'Quantidade' },
                { key: 'unitPrice', header: 'Preço Unitário', render: (item) => `R$ ${Number(item.unitPrice).toFixed(2)}` },
                { key: 'total', header: 'Total', render: (item) => `R$ ${Number(item.total).toFixed(2)}` },
            ],
            'produtos-mais-vendidos': [
                { key: 'product', header: 'Produto' },
                { key: 'quantitySold', header: 'Quantidade' },
                { key: 'revenue', header: 'Receita', render: (item) => `R$ ${Number(item.revenue).toFixed(2)}` },
            ],
            'estoque-atual': [
                { key: 'sku', header: 'SKU' },
                { key: 'product', header: 'Produto' },
                { key: 'currentStock', header: 'Quantidade' },
                { key: 'minStock', header: 'Mínimo' },
                { key: 'salePrice', header: 'Preço', render: (item) => `R$ ${Number(item.salePrice).toFixed(2)}` },
            ],
            'contas-receber': [
                { key: 'client', header: 'Cliente' },
                { key: 'invoice', header: 'Fatura' },
                { key: 'dueDate', header: 'Vencimento' },
                { key: 'value', header: 'Valor', render: (item) => `R$ ${Number(item.value).toFixed(2)}` },
                { key: 'status', header: 'Status' },
            ],
            inadimplencia: [
                { key: 'client', header: 'Cliente' },
                { key: 'invoice', header: 'Fatura' },
                { key: 'dueDate', header: 'Vencimento' },
                { key: 'value', header: 'Valor', render: (item) => `R$ ${Number(item.value).toFixed(2)}` },
                { key: 'status', header: 'Status' },
            ],
            'contas-pagar': [
                { key: 'supplier', header: 'Fornecedor' },
                { key: 'invoice', header: 'NF' },
                { key: 'dueDate', header: 'Vencimento' },
                { key: 'value', header: 'Valor', render: (item) => `R$ ${Number(item.value).toFixed(2)}` },
                { key: 'status', header: 'Status' },
            ],
            'pagamentos-metodo': [
                { key: 'paymentMethod', header: 'Método' },
                { key: 'transactions', header: 'Transações' },
                { key: 'totalAmount', header: 'Valor Total', render: (item) => `R$ ${Number(item.totalAmount).toFixed(2)}` },
            ],
            'maiores-compradores': [
                { key: 'client', header: 'Cliente' },
                { key: 'email', header: 'Email' },
                { key: 'totalPurchases', header: 'Compras' },
                { key: 'totalSpent', header: 'Total Gasto', render: (item) => `R$ ${Number(item.totalSpent).toFixed(2)}` },
            ],
            'clientes-cidade': [
                { key: 'city', header: 'Cidade' },
                { key: 'state', header: 'Estado' },
                { key: 'clientCount', header: 'Qtd Clientes' },
                { key: 'totalSpent', header: 'Total Gasto', render: (item) => `R$ ${Number(item.totalSpent).toFixed(2)}` },
            ],
        };

        return columnMap[slug] ?? [];
    }, [slug]);

    const title = reportTitles[slug] || 'Relatório';

    const handleExportExcel = () => {
        void exportToExcel(data as unknown as Record<string, unknown>[], {
            fileName: title,
        });
    };

    const handleExportPDF = () => {
        const pdfColumns = columns.map((col) => ({ key: col.key, header: col.header }));
        void exportToPDF(
            data as unknown as Record<string, unknown>[],
            pdfColumns as never,
            { fileName: title, title },
        );
    };

    return (
        <ReportTable
            data={data as unknown as Record<string, unknown>[]}
            columns={columns as never}
            title={title}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
        />
    );
}
