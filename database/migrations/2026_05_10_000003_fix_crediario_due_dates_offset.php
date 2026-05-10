<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $rows = DB::table('account_receivables as ar')
            ->join('sales as s', 's.id', '=', 'ar.sale_id')
            ->where('s.payment_method', 'crediario')
            ->whereNotNull('ar.installment_number')
            ->whereNotNull('ar.entry_date')
            ->select('ar.id', 'ar.entry_date', 'ar.installment_number', 'ar.due_date')
            ->get();

        foreach ($rows as $row) {
            $expected = Carbon::parse($row->entry_date)
                ->addMonthsNoOverflow((int) $row->installment_number)
                ->toDateString();

            $expectedMinusOneDay = Carbon::parse($expected)
                ->subDay()
                ->toDateString();

            if ($row->due_date !== $expectedMinusOneDay) {
                continue;
            }

            DB::table('account_receivables')
                ->where('id', $row->id)
                ->update(['due_date' => $expected]);
        }
    }

    public function down(): void
    {
        // no-op: data correction migration
    }
};
