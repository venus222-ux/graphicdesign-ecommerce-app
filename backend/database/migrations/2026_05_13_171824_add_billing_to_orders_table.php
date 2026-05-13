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
        Schema::table('orders', function (Blueprint $table) {
           $table->string('billing_name')->nullable();
           $table->string('billing_email')->nullable();

           $table->string('billing_company')->nullable();
           $table->string('billing_vat_number')->nullable();

           $table->string('billing_address_1')->nullable();
           $table->string('billing_address_2')->nullable();

           $table->string('billing_city')->nullable();
           $table->string('billing_state')->nullable();
           $table->string('billing_postal_code')->nullable();
           $table->string('billing_country')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            //
        });
    }
};
