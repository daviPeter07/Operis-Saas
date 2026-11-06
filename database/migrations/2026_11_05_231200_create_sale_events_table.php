<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Sale history shown on the sale details: registered, edited, payments, completed, cancelled.
 * Append-only; rows go away with the sale.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('sale_events')) {
            return;
        }

        Schema::create('sale_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->string('type', 30);
            $table->string('description');
            $table->decimal('amount', 14, 2)->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['sale_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_events');
    }
};
