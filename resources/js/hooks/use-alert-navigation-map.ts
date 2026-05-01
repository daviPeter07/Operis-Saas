import { useMemo } from 'react';
import type { AlertTarget } from '@/types/table-ui-bugs';

export function useAlertNavigationMap() {
    return useMemo<Record<string, AlertTarget>>(
        () => ({
            'late-payments': {
                path: '/dashboard/accounts-payable',
                filters: { status: 'pending' },
            },
            'undelivered-orders': {
                path: '/dashboard/sales',
                filters: { status: 'pending' },
            },
            'orders-to-confirm': {
                path: '/dashboard/sales',
                filters: { status: 'pending' },
            },
            'out-of-stock-products': {
                path: '/dashboard/inventory',
                filters: { status: 'out_of_stock' },
            },
        }),
        [],
    );
}
