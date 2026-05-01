import { mockClients, mockSuppliers } from '@/lib/mocks/mock-data';

const locationSet = new Set(
    [...mockClients, ...mockSuppliers].map(
        (entry) => `${entry.state}::${entry.city}`,
    ),
);

export const LOCATION_SOURCE = Array.from(locationSet)
    .map((entry) => {
        const [state, city] = entry.split('::');

        return { state, city };
    })
    .sort((a, b) => {
        if (a.state === b.state) {
            return a.city.localeCompare(b.city, 'pt-BR');
        }

        return a.state.localeCompare(b.state, 'pt-BR');
    });

export const STATE_OPTIONS = Array.from(
    new Set(LOCATION_SOURCE.map((item) => item.state)),
)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .map((value) => ({ value, label: value }));

export function getCityOptionsByState(state: string) {
    if (!state) {
        return [];
    }

    return LOCATION_SOURCE.filter((item) => item.state === state).map(
        (item) => ({ value: item.city, label: item.city }),
    );
}
