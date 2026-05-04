<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('account_payables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('purchase_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('installment_number')->nullable();
            $table->date('due_date');
            $table->decimal('amount', 14, 2);
            $table->string('status')->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->string('paid_method')->nullable();
            $table->text('payment_notes')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'status', 'due_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('account_payables');
    }
};
