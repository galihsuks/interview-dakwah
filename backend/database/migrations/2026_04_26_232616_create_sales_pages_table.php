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
        Schema::create('sales_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('product_name');
            $table->text('product_description');
            $table->json('key_features')->nullable();
            $table->string('target_audience')->nullable();
            $table->string('price')->nullable();
            $table->text('unique_selling_points')->nullable();
            $table->string('headline');
            $table->string('subheadline')->nullable();
            $table->json('benefits')->nullable();
            $table->json('features_breakdown')->nullable();
            $table->text('social_proof_placeholder')->nullable();
            $table->string('pricing_display')->nullable();
            $table->string('cta_text');
            $table->longText('generated_html');
            $table->json('generation_meta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_pages');
    }
};
