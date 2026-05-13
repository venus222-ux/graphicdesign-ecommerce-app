<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {

            if (!Schema::hasColumn('orders', 'subtotal')) {
                $table->decimal('subtotal', 10, 2)->default(0.00);
            }

            if (!Schema::hasColumn('orders', 'vat_percent')) {
                $table->decimal('vat_percent', 5, 2)->default(21.00);
            }

            if (!Schema::hasColumn('orders', 'vat')) {
                $table->decimal('vat', 10, 2)->default(0.00);
            }

            if (!Schema::hasColumn('orders', 'total')) {
                $table->decimal('total', 10, 2)->default(0.00);
            }
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            // Do nothing (safe rollback)
        });
    }
};
