<?php

namespace Database\Seeders;

use App\Models\SalesPage;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'demo.review@dakwah.test'],
            [
                'name' => 'Demo Reviewer',
                'password' => Hash::make('Password123!'),
            ],
        );

        SalesPage::updateOrCreate(
            [
                'user_id' => $user->id,
                'product_name' => 'Dakwah Growth Toolkit',
            ],
            [
                'product_description' => 'Toolkit untuk bantu tim dakwah mengelola campaign konten secara terstruktur.',
                'key_features' => ['Content planner', 'Audience insights', 'Auto campaign checklist'],
                'target_audience' => 'Content team dan social media manager',
                'price' => 'Rp249.000/bulan',
                'unique_selling_points' => 'Fokus pada workflow dakwah digital dengan template siap pakai.',
                'detected_language' => 'id',
            ],
        );

        $salesPage = SalesPage::query()
            ->where('user_id', $user->id)
            ->where('product_name', 'Dakwah Growth Toolkit')
            ->first();

        if ($salesPage === null) {
            return;
        }

        $salesPage->htmlVariants()->delete();
        $salesPage->htmlVariants()->createMany([
            [
                'label' => 'Reference 1',
                'plain_html' => '<!doctype html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Dakwah Growth Toolkit</title></head><body><main><h1>Kelola Campaign Dakwah Lebih Terarah</h1><p>Satu toolkit untuk planning, eksekusi, dan evaluasi.</p></main></body></html>',
            ],
            [
                'label' => 'Reference 2',
                'plain_html' => '<!doctype html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Dakwah Growth Toolkit</title></head><body><main><h1>Bangun Workflow Konten yang Konsisten</h1><p>Dirancang untuk tim dakwah digital yang ingin scaling tanpa chaos.</p></main></body></html>',
            ],
            [
                'label' => 'Reference 3',
                'plain_html' => '<!doctype html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Dakwah Growth Toolkit</title></head><body><main><h1>Eksekusi Campaign Lebih Cepat</h1><p>Satukan planner, checklist, dan insight dalam satu dashboard.</p></main></body></html>',
            ],
            [
                'label' => 'Reference 4',
                'plain_html' => '<!doctype html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Dakwah Growth Toolkit</title></head><body><main><h1>Konten Dakwah yang Lebih Berdampak</h1><p>Fokuskan tim pada strategi, bukan kebingungan operasional.</p></main></body></html>',
            ],
        ]);
    }
}
