import { mockPurchases } from '@/lib/mocks/mock-data';
import type { Purchase } from '@/lib/mocks/mock-data';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import {
    formatDateBR,
    formatCurrencyBR,
    translateStatus,
    translatePaymentMethod,
    formatQuantityWithUnit,
} from '@/lib/format';
import { useState } from 'react';

export function AccountsPayableModule() {
    const [purchases, setPurchases] = useState(() => [...mockPurchases]); // copy of mockPurchases

    const pendingPurchases = purchases.filter(
        (purchase) => purchase.status === 'pending',
    );

    const handlePay = (purchase: Purchase) => {
        setPurchases((prevPurchases) =>
            prevPurchases.map((p) =>
                p.id === purchase.id ? { ...p, status: 'completed' } : p,
            ),
        );
    };

    const columns: Column<Purchase>[] = [
        { key: 'supplierName', header: 'Fornecedor' },
        {
            key: 'total',
            header: 'Valor',
            render: (val: unknown) => formatCurrencyBR(Number(val)),
        },
        {
            key: 'status',
            header: 'Status',
            render: (val: unknown) => {
                const statusText = translateStatus(String(val));
                let bgColor = 'bg-gray-100 text-gray-800';
                if (val === 'pending')
                    bgColor = 'bg-yellow-100 text-yellow-800';
                if (val === 'completed')
                    bgColor = 'bg-green-100 text-green-800';
                if (val === 'cancelled') bgColor = 'bg-red-100 text-red-800';
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor}`}
                    >
                        {statusText}
                    </span>
                );
            },
        },
        {
            key: 'paymentMethod',
            header: 'Método',
            render: (val: unknown) => translatePaymentMethod(String(val)),
        },
        {
            key: 'items',
            header: 'Itens',
            render: (val: unknown) => formatQuantityWithUnit(Number(val)),
        },
        {
            key: 'createdAt',
            header: 'Data',
            render: (val: unknown) => formatDateBR(String(val)),
        },
        {
            key: 'pay',
            header: 'Pagar',
            render: (_, row: Purchase) => (
                <input
                    type="checkbox"
                    checked={row.status === 'completed'}
                    onChange={(e) => {
                        if (e.target.checked) {
                            handlePay(row);
                        }
                    }}
                    className="text-primary-600 h-4 w-4"
                />
            ),
        },
    ];

    const filterFields = [
        { key: 'supplierName', label: 'Fornecedor', type: 'text' as const },
        {
            key: 'status',
            label: 'Status',
            type: 'select' as const,
            options: [
                { value: 'pending', label: 'Pendente' },
                { value: 'completed', label: 'Concluído' },
                { value: 'cancelled', label: 'Cancelado' },
            ],
        },
        {
            key: 'paymentMethod',
            label: 'Método de Pagamento',
            type: 'select' as const,
            options: [
                { value: 'money', label: 'Dinheiro' },
                { value: 'credit', label: 'Crédito' },
                { value: 'debit', label: 'Débito' },
                { value: 'pix', label: 'PIX' },
            ],
        },
    ];

    return (
        <GenericTable
            data={pendingPurchases}
            columns={columns}
            title="Contas a Pagar"
            filterFields={filterFields}
            onCreate={() => {}}
        />
    );
}
