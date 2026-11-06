<?php

namespace App\Http\Resources;

use Carbon\CarbonInterface;
use Illuminate\Http\Resources\Json\JsonResource;

class ApiResource extends JsonResource
{
    /**
     * A stored UTC moment as "Y-m-d H:i:s" in the business timezone (Manaus).
     */
    protected function businessTime(?CarbonInterface $moment): ?string
    {
        return $moment?->clone()->setTimezone(config('app.business_timezone'))->format('Y-m-d H:i:s');
    }
}
