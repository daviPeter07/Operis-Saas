import { ApiService } from '@/lib/apiService';
import type { ListParams, PaginatedData } from '@/lib/apiService';
import type { Service, ServicePayload } from '@/schemas/service';
import { toNumber } from '@/services/normalizers';

function normalizeService(service: Service): Service {
    return {
        ...service,
        price: toNumber(service.price),
        cost:
            service.cost === null || service.cost === undefined
                ? null
                : toNumber(service.cost),
        performed_count: toNumber(service.performed_count),
    };
}

class ServiceService extends ApiService<Service> {
    constructor() {
        super({ basePath: '/services' });
    }

    async list(params?: ListParams): Promise<PaginatedData<Service>> {
        const response = await super.list(params);

        return { ...response, data: response.data.map(normalizeService) };
    }

    async create(data: ServicePayload): Promise<Service> {
        return normalizeService(await super.create(data));
    }

    async update(id: number, data: ServicePayload): Promise<Service> {
        return normalizeService(await super.update(id, data));
    }

    async delete(id: number): Promise<{ success: boolean }> {
        return super.delete(id);
    }
}

export const serviceService = new ServiceService();
