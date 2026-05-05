import * as React from 'react';
import type { UiSupplier } from '@/types/dashboard-entities';
import { buildQuickCreateSupplierPayload } from '@/utils/suppliers';

type UseQuickCreateSupplierParams = {
    onCreateSupplier: (data: UiSupplier) => Promise<UiSupplier>;
    onSupplierCreated: (supplier: UiSupplier) => void;
};

export function useQuickCreateSupplier({
    onCreateSupplier,
    onSupplierCreated,
}: UseQuickCreateSupplierParams) {
    return React.useCallback(
        async (supplierName: string) => {
            const createdSupplier = await onCreateSupplier(
                buildQuickCreateSupplierPayload(supplierName),
            );

            onSupplierCreated(createdSupplier);
        },
        [onCreateSupplier, onSupplierCreated],
    );
}
