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
        Schema::table('gemini_accounts', function (Blueprint $table) {
            $table->unsignedSmallInteger('rpm')->default(5)->after('model');
            $table->unsignedSmallInteger('rpd')->default(20)->after('rpm');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gemini_accounts', function (Blueprint $table) {
            $table->dropColumn(['rpm', 'rpd']);
        });
    }
};
