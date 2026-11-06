import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { withAppBasePath } from '@/constants/workspace';
import { servicesQueryKey } from '@/hooks/use-services';
import type { Service, ServicePayload } from '@/schemas/service';
import { serviceService } from '@/services/services';
import { parseCurrencyInput, toMoneyInput } from '@/utils/form-fields';
import type { ApiParams, ServiceForm, ServiceRow } from './types';

export function useServicesPage(apiParams: ApiParams) {
    return useQuery({
        queryKey: [...servicesQueryKey, 'page', apiParams],
        queryFn: () => serviceService.list(apiParams),
        placeholderData: keepPreviousData,
    });
}

export async function fetchAllServices(
    apiParams: ApiParams,
): Promise<Service[]> {
    const filters = Object.fromEntries(
        Object.entries(apiParams).filter(
            ([key]) => key !== 'page' && key !== 'per_page',
        ),
    );

    return (await serviceService.list(filters)).data;
}

export function toServiceRow(service: Service): ServiceRow {
    return {
        id: String(service.id),
        service,
        name: service.name,
        description: service.description ?? '',
        price: service.price,
        cost: service.cost,
        performedCount: service.performed_count,
        salesUrl: withAppBasePath(`/dashboard/sales?service_id=${service.id}`),
        status: service.status,
    };
}

export function toServiceFormValues(
    service?: Service | null,
    initialName = '',
): ServiceForm {
    return {
        name: service?.name ?? initialName,
        description: service?.description ?? '',
        price: service ? toMoneyInput(service.price) || 'R$ 0,00' : '',
        cost:
            service?.cost === null || service?.cost === undefined
                ? ''
                : toMoneyInput(service.cost) || 'R$ 0,00',
        status: service?.status ?? 'active',
    };
}

export function toServicePayload(values: ServiceForm): ServicePayload {
    const description = values.description.trim();

    return {
        name: values.name.trim(),
        description: description === '' ? null : description,
        price: parseCurrencyInput(values.price),
        cost:
            values.cost.trim() === '' ? null : parseCurrencyInput(values.cost),
        status: values.status,
    };
}
