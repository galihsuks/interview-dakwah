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
        Schema::table('sales_pages', function (Blueprint $table) {
            $table->dropColumn([
                'headline',
                'subheadline',
                'benefits',
                'features_breakdown',
                'social_proof_placeholder',
                'pricing_display',
                'cta_text',
                'generated_html',
                'html_variants',
                'generation_meta',
            ]);
        });

        Schema::create('html_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_page_id')->constrained('sales_pages')->cascadeOnDelete();
            $table->string('label');
            $table->longText('plain_html');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('html_variants');

        Schema::table('sales_pages', function (Blueprint $table) {
            $table->string('headline')->nullable()->after('unique_selling_points');
            $table->string('subheadline')->nullable()->after('headline');
            $table->json('benefits')->nullable()->after('subheadline');
            $table->json('features_breakdown')->nullable()->after('benefits');
            $table->text('social_proof_placeholder')->nullable()->after('features_breakdown');
            $table->string('pricing_display')->nullable()->after('social_proof_placeholder');
            $table->string('cta_text')->nullable()->after('pricing_display');
            $table->longText('generated_html')->nullable()->after('cta_text');
            $table->json('html_variants')->nullable()->after('generated_html');
            $table->json('generation_meta')->nullable()->after('detected_language');
        });
    }
};
