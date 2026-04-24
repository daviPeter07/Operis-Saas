import { mockSales } from '@/lib/mocks/mock-data';
import type { Sale } from '@/lib/mocks/mock-data';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import {
    formatDateBR,
    formatCurrencyBR,
    translatePaymentMethod,
} from '@/lib/format';
import { useState } from 'react';

export function AccountsReceivableModule() {
    const [sales, setSales] = useState(() => [...mockSales]); // copy of mockSales

    const pendingSales = sales.filter((sale) => sale.status === 'pending');

    const handleReceive = (sale: Sale) => {
        setSales((prevSales) =>
            prevSales.map((s) =>
                s.id === sale.id ? { ...s, status: 'completed' } : s,
            ),
        );
    };

    const columns: Column<Sale>[] = [
        { key: 'clientName', header: 'Cliente' },
        {
            key: 'total',
            header: 'Valor',
            render: (val: unknown) => formatCurrencyBR(Number(val)),
        },
        {
            key: 'paymentMethod',
            header: 'Método',
            render: (val: unknown) => translatePaymentMethod(String(val)),
        },
        {
            key: 'createdAt',
            header: 'Data',
            render: (val: unknown) => formatDateBR(String(val)),
        },
        {
            key: 'receive',
            header: 'Receber',
            render: (_, row: Sale) => (
                <input
                    type="checkbox"
                    checked={row.status === 'completed'}
                    onChange={(e) => {
                        if (e.target.checked) {
                            handleReceive(row);
                        }
                    }}
                    className="text-primary-600 h-4 w-4"
                />
            ),
        },
    ];

    const filterFields = [
        { key: 'clientName', label: 'Cliente', type: 'text' as const },
        {
            key: 'paymentMethod',
            label: 'Método de Pagamento',
            type: 'select' as const,
            options: [
                { value: 'money', label: 'Dinheiro' },
                { value: 'credit', label: 'Crédito' },
                { value: 'debit', label: 'Débito' },
                { value: 'pix', label: 'PIX' },
                { value: 'installment', label: 'Parcelado' },
            ],
        },
    ];

    return (
        <GenericTable
            data={pendingSales}
            columns={columns}
            title="Contas a Receber"
            filterFields={filterFields}
            onCreate={() => {}}
        />
    );
}
