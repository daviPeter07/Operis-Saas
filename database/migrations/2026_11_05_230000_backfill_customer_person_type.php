<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The customer form never sent person_type, so every customer was saved as "pf".
 * A document with exactly 14 digits is a CNPJ, so those customers are "pj".
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('customers')
            ->where('person_type', 'pf')
            ->whereNotNull('document')
            ->orderBy('id')
            ->select(['id', 'document'])
            ->chunkById(500, function ($customers): void {
                $cnpjCustomerIds = $customers
                    ->filter(fn ($customer): bool => strlen(preg_replace('/\D/', '', (string) $customer->document)) === 14)
                    ->pluck('id');

                if ($cnpjCustomerIds->isNotEmpty()) {
                    DB::table('customers')->whereIn('id', $cnpjCustomerIds)->update(['person_type' => 'pj']);
                }
            });
    }

    public function down(): void
    {
        // The original values were all "pf" by mistake; there is nothing meaningful to restore.
    }
};
