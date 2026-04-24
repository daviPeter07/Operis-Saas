import * as React from 'react';
import { ReportTable } from '@/components/table/report-table';
import type { ReportColumn } from '@/components/table/report-table';
import { exportToExcel } from '@/lib/export-excel';
import { exportToPDF } from '@/lib/export-pdf';
import { getMockReportData } from '@/lib/mocks/mock-reports';

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
    'compras-fornecedor': 'Compras por Fornecedor',
    'compras-categoria': 'Compras por Categoria',
    'pagamentos-metodo': 'Pagamentos por Método',
    'maiores-compradores': 'Maiores Compradores',
    'clientes-cidade': 'Clientes por Cidade',
};

const reportColumns: Record<string, ReportColumn<Record<string, unknown>>[]> = {
    vendas: [
        { key: 'date', header: 'Data' },
        { key: 'client', header: 'Cliente' },
        { key: 'product', header: 'Produto' },
        { key: 'quantity', header: 'Quantidade' },
        {
            key: 'unitPrice',
            header: 'Preço Unitário',
            render: (item) => `R$ ${Number(item.unitPrice).toFixed(2)}`,
        },
        {
            key: 'total',
            header: 'Total',
            render: (item) => `R$ ${Number(item.total).toFixed(2)}`,
        },
    ],
    'produtos-mais-vendidos': [
        { key: 'product', header: 'Produto' },
        { key: 'quantitySold', header: 'Quantidade' },
        {
            key: 'revenue',
            header: 'Receita',
            render: (item) => `R$ ${Number(item.revenue).toFixed(2)}`,
        },
    ],
    'vendas-categoria': [
        { key: 'category', header: 'Categoria' },
        { key: 'productsSold', header: 'Produtos' },
        { key: 'quantity', header: 'Quantidade' },
        {
            key: 'revenue',
            header: 'Receita',
            render: (item) => `R$ ${Number(item.revenue).toFixed(2)}`,
        },
    ],
    'vendas-marca': [
        { key: 'brand', header: 'Marca' },
        { key: 'productsSold', header: 'Produtos' },
        { key: 'quantity', header: 'Quantidade' },
        {
            key: 'revenue',
            header: 'Receita',
            render: (item) => `R$ ${Number(item.revenue).toFixed(2)}`,
        },
    ],
    'estoque-atual': [
        { key: 'sku', header: 'SKU' },
        { key: 'product', header: 'Produto' },
        { key: 'currentStock', header: 'Quantidade' },
        { key: 'minStock', header: 'Estoque Mínimo' },
        {
            key: 'salePrice',
            header: 'Preço',
            render: (item) => `R$ ${Number(item.salePrice).toFixed(2)}`,
        },
    ],
    'contas-receber': [
        { key: 'client', header: 'Cliente' },
        { key: 'invoice', header: 'Fatura' },
        { key: 'dueDate', header: 'Vencimento' },
        {
            key: 'value',
            header: 'Valor',
            render: (item) => `R$ ${Number(item.value).toFixed(2)}`,
        },
        { key: 'status', header: 'Status' },
    ],
    'contas-pagar': [
        { key: 'supplier', header: 'Fornecedor' },
        { key: 'invoice', header: 'NF' },
        { key: 'dueDate', header: 'Vencimento' },
        {
            key: 'value',
            header: 'Valor',
            render: (item) => `R$ ${Number(item.value).toFixed(2)}`,
        },
        { key: 'status', header: 'Status' },
    ],
    'compras-fornecedor': [
        { key: 'supplier', header: 'Fornecedor' },
        { key: 'category', header: 'Categoria' },
        { key: 'purchases', header: 'Compras' },
        {
            key: 'total',
            header: 'Total',
            render: (item) => `R$ ${Number(item.total).toFixed(2)}`,
        },
    ],
    'compras-categoria': [
        { key: 'category', header: 'Categoria' },
        { key: 'suppliers', header: 'Fornecedores' },
        { key: 'purchases', header: 'Compras' },
        {
            key: 'total',
            header: 'Total',
            render: (item) => `R$ ${Number(item.total).toFixed(2)}`,
        },
    ],
    'pagamentos-metodo': [
        { key: 'paymentMethod', header: 'Método' },
        { key: 'transactions', header: 'Transações' },
        {
            key: 'totalAmount',
            header: 'Valor Total',
            render: (item) => `R$ ${Number(item.totalAmount).toFixed(2)}`,
        },
    ],
    'maiores-compradores': [
        { key: 'client', header: 'Cliente' },
        { key: 'email', header: 'Email' },
        { key: 'totalPurchases', header: 'Total Compras' },
        {
            key: 'totalSpent',
            header: 'Total Gasto',
            render: (item) => `R$ ${Number(item.totalSpent).toFixed(2)}`,
        },
    ],
    'clientes-cidade': [
        { key: 'city', header: 'Cidade' },
        { key: 'state', header: 'Estado' },
        { key: 'clientCount', header: 'Qtd Clientes' },
        {
            key: 'totalSpent',
            header: 'Total Gasto',
            render: (item) => `R$ ${Number(item.totalSpent).toFixed(2)}`,
        },
    ],
};

export function ReportPage({ slug }: ReportPageProps) {
    const data = getMockReportData(slug as never);
    const columns = reportColumns[slug] || [];
    const title = reportTitles[slug] || 'Relatório';

    const handleExportExcel = () => {
        exportToExcel(data as unknown as Record<string, unknown>[], {
            fileName: title,
        });
    };

    const handleExportPDF = () => {
        const pdfColumns = columns.map((col) => ({
            key: col.key,
            header: col.header,
        }));
        exportToPDF(
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
