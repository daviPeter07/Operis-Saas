<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Purchase history shown on the purchase details: registered, edited, payments, completed,
 * cancelled. Append-only; rows go away with the purchase.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('purchase_events')) {
            return;
        }

        Schema::create('purchase_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('purchase_id')->constrained()->cascadeOnDelete();
            $table->string('type', 30);
            $table->string('description');
            $table->decimal('amount', 14, 2)->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['purchase_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_events');
    }
};
