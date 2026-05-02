import * as React from 'react';
import type { Supplier } from '@/lib/mocks/mock-data';
import { buildQuickCreateSupplierPayload } from '@/utils/suppliers';

type UseQuickCreateSupplierParams = {
    onCreateSupplier: (data: Supplier) => Supplier;
    onSupplierCreated: (supplier: Supplier) => void;
};

export function useQuickCreateSupplier({
    onCreateSupplier,
    onSupplierCreated,
}: UseQuickCreateSupplierParams) {
    return React.useCallback(
        (supplierName: string) => {
            const createdSupplier = onCreateSupplier(
                buildQuickCreateSupplierPayload(supplierName),
            );

            onSupplierCreated(createdSupplier);
        },
        [onCreateSupplier, onSupplierCreated],
    );
}
