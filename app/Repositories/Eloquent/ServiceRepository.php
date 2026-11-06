<?php

namespace App\Repositories\Eloquent;

use App\Models\Service;
use App\Repositories\Contracts\ServiceRepositoryInterface;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ServiceRepository implements ServiceRepositoryInterface
{
    public function paginateByCompany(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator
    {
        $query = Service::query()->forCompany($companyId)->withPerformedCount();

        if ($tableQuery === null) {
            return $query->latest()->paginate();
        }

        $tableQuery
            ->applyTextFilters($query, ['name' => 'name', 'description' => 'description'])
            ->applyExactFilters($query, ['status' => 'status'])
            ->applyDateRange($query, 'created_at', isTimestamp: true)
            ->applySort($query, [
                'name' => 'name',
                'price' => 'price',
                'cost' => 'cost',
                'performed_count' => 'performed_count',
                'created_at' => 'created_at',
            ]);

        $id = $tableQuery->filter('id');

        if ($id !== null) {
            $query->whereKey((int) $id);
        }

        return $tableQuery->paginate($query);
    }

    public function createForCompany(int $companyId, array $data): Service
    {
        return Service::query()->create([...$data, 'company_id' => $companyId]);
    }

    public function update(Service $service, array $data): Service
    {
        $service->update($data);

        return Service::query()->withPerformedCount()->findOrFail($service->id);
    }

    public function delete(Service $service): void
    {
        $service->delete();
    }
}
