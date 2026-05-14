import { useMemo } from 'react';
import { withAppBasePath } from '@/constants/workspace';
import type { AlertTarget } from '@/types/table-ui-bugs';

export function useAlertNavigationMap() {
    return useMemo<Record<string, AlertTarget>>(
        () => ({
            'late-payments': {
                path: withAppBasePath('/dashboard/accounts-payable'),
                filters: { status: 'overdue' },
            },
            'undelivered-orders': {
                path: withAppBasePath('/dashboard/sales'),
                filters: { status: 'pending' },
            },
            'orders-to-pay': {
                path: withAppBasePath('/dashboard/sales'),
                filters: { status: 'pending' },
            },
            'purchases-to-pay': {
                path: withAppBasePath('/dashboard/accounts-payable'),
                filters: { status: 'pending' },
            },
            'out-of-stock-products': {
                path: withAppBasePath('/dashboard/inventory'),
                filters: { stock_status: 'out_of_stock' },
            },
        }),
        [],
    );
}
