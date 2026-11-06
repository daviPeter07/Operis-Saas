<?php

namespace App\Services\Services;

use App\Models\Service;
use App\Repositories\Contracts\ServiceRepositoryInterface;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class ServiceService
{
    public function __construct(private readonly ServiceRepositoryInterface $services) {}

    public function list(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator
    {
        return $this->services->paginateByCompany($companyId, $tableQuery);
    }

    public function create(int $companyId, array $data): Service
    {
        return $this->services->createForCompany($companyId, ['status' => 'active', ...$data]);
    }

    public function update(Service $service, array $data): Service
    {
        return $this->services->update($service, $data);
    }

    /**
     * A sold service stays in the history of its sales: it can only be deactivated.
     */
    public function delete(Service $service): void
    {
        if ($service->saleItems()->exists()) {
            throw ValidationException::withMessages([
                'service' => 'Este serviço já foi vendido. Inative-o em vez de excluir.',
            ]);
        }

        $this->services->delete($service);
    }
}
