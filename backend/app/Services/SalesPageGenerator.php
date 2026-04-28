<?php

namespace App\Services;

use App\Models\GeminiAccount;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SalesPageGenerator
{
    public function generate(array $input, User $user): array
    {
        $decoded = $this->requestGeminiJson($this->buildPrompt($input), $user);

        return $this->normalizeGeminiOutput($decoded, $input);
    }

    public function regenerateVariantSection(array $variant, string $section, string $instructionPrompt, User $user): string
    {
        $decoded = $this->requestGeminiJson(
            $this->buildVariantRegeneratePrompt($variant, $section, $instructionPrompt),
            $user
        );

        $plainHtml = trim((string) ($decoded['plain_html'] ?? ''));
        if (! $this->isFullHtmlDocument($plainHtml)) {
            throw new RuntimeException('Gagal regenerate section: Gemini tidak mengembalikan full HTML document yang valid.');
        }

        return $plainHtml;
    }

    private function requestGeminiJson(string $prompt, User $user): array
    {
        $account = GeminiAccount::getSettingsByUserId((int) $user->id);
        $apiKey = $account['api_key'] ?? null;
        $model = $account['model'] ?? config('services.gemini.model', 'gemini-3-flash-preview');

        if (blank($apiKey)) {
            throw new RuntimeException('Gemini API key belum diisi. Buka halaman Settings untuk mengatur API key.');
        }

        $response = Http::timeout(90)
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
            ]);

        $responseJSON = $response->json();

        $message = data_get($responseJSON, 'error.message');
        if ($message) {
            $reason = is_string($message) && $message !== ''
                ? $message
                : 'respons dari Gemini tidak sukses';

            throw new RuntimeException('Gagal generate sales page: '.$reason.'.');
        }

        $text = data_get($responseJSON, 'candidates.0.content.parts.0.text');
        if (! is_string($text) || blank($text)) {
            throw new RuntimeException('Gagal generate sales page: output teks dari Gemini kosong.');
        }

        $normalizedJson = preg_replace('/^```json|```$/m', '', trim($text));
        $decoded = json_decode($normalizedJson, true);

        if (! is_array($decoded)) {
            throw new RuntimeException('Gagal generate sales page: format output Gemini bukan JSON valid.');
        }

        $this->syncQuotaInfo((int) $user->id, data_get($responseJSON, 'usageMetadata.totalTokenCount'));

        return $decoded;
    }

    private function buildPrompt(array $input): string
    {
        $features = implode(', ', $input['key_features'] ?? []);
        $productName = $input['product_name'];
        $productDescription = $input['product_description'];
        $targetAudience = $input['target_audience'] ?? 'General';
        $price = $input['price'] ?? 'Contact us';
        $usp = $input['unique_selling_points'] ?? 'N/A';

        return <<<PROMPT
            Kamu adalah expert landing page strategist, conversion copywriter, UI/UX designer, dan frontend developer senior.

            Buatkan 4 variasi landing page sales yang modern, elegant, SEO friendly, responsive, dan siap pakai berdasarkan input berikut:

            INPUT:
            - nama produk/layanan: {$productName}
            - deskripsi produk: {$productDescription}
            - fitur: {$features}
            - target audience: {$targetAudience}
            - harga: {$price}
            - unique selling points: {$usp}

            ATURAN BAHASA:
            - Deteksi bahasa utama dari input, terutama dari deskripsi produk.
            - Jika input mayoritas Bahasa Indonesia, isi "detected_language" dengan "id".
            - Jika input mayoritas English, isi "detected_language" dengan "en".
            - Seluruh copywriting landing page harus mengikuti bahasa yang terdeteksi.
            - Jangan mencampur bahasa kecuali nama produk, istilah brand, atau istilah teknis yang memang diperlukan.

            ATURAN OUTPUT:
            - Output harus hanya berupa valid JSON.
            - Jangan gunakan markdown.
            - Jangan beri penjelasan tambahan.
            - Jangan gunakan komentar.
            - Jangan bungkus output dengan ```json.
            - Pastikan JSON valid dan bisa langsung di-parse.
            - Escape semua karakter yang diperlukan di dalam string JSON.

            FORMAT JSON WAJIB:
            {
              "detected_language": "id" | "en",
              "variants": [
                {
                  "label": "Reference 1",
                  "plain_html": "full HTML document"
                },
                {
                  "label": "Reference 2",
                  "plain_html": "full HTML document"
                },
                {
                  "label": "Reference 3",
                  "plain_html": "full HTML document"
                },
                {
                  "label": "Reference 4",
                  "plain_html": "full HTML document"
                }
              ]
            }

            ATURAN PLAIN_HTML:
            - Setiap "plain_html" harus berisi full HTML document lengkap.
            - HTML harus dimulai dari <!doctype html>.
            - Sertakan <html>, <head>, <body>, <meta charset>, <meta viewport>, <title>, meta description, <style>, dan jika perlu <script>.
            - Semua CSS dan JavaScript harus inline di dalam file HTML.
            - Jangan gunakan external CSS, external JavaScript, framework.
            - Jika di perlukan CDN/font eksternal (link)/gambar eksternal (link) diperbolehkan jika itu bisa mempercantik dan memperjelas isi landing page tersebut.
            - Tidak boleh ada dependency eksternal.
            - Gunakan semantic HTML.
            - Landing page harus SEO friendly.
            - Landing page harus responsive untuk mobile, tablet, dan desktop.

            STRUKTUR LANDING PAGE:
            Setiap landing page minimal memiliki:
            - Hero section dengan headline sales yang kuat
            - Subheadline
            - CTA utama
            - CTA sekunder jika relevan
            - Section masalah target audience
            - Section solusi
            - Section fitur
            - Section benefit
            - Section unique selling points
            - Section pricing/harga
            - Section testimonial atau social proof fiktif yang realistis
            - Section FAQ
            - Final CTA
            - Footer

            ARAHAN DESAIN:
            Buat 4 variasi landing page dengan konsep visual berbeda:

            1. Reference 1:
            Konsep premium, elegant, eksklusif, luxury, cocok untuk produk/layanan bernilai tinggi.

            2. Reference 2:
            Konsep bold, conversion-focused, energetic, direct response, CTA kuat.

            3. Reference 3:
            Konsep minimalist, clean, professional, modern SaaS/startup style.

            4. Reference 4:
            Konsep storytelling, emotional sales, trust-building, human-centered.

            ARAHAN COPYWRITING:
            - Generate seluruh copywriting yang diperlukan untuk memasarkan produk berdasarkan input.
            - Gunakan headline yang persuasive.
            - Fokus pada pain point target audience.
            - Jelaskan value proposition dengan jelas.
            - Tonjolkan fitur, benefit, harga, dan unique selling points.
            - Gunakan CTA yang relevan.
            - Buat copy terasa natural, profesional, dan meyakinkan.
            - Jangan membuat klaim berlebihan yang tidak didukung input.

            ARAHAN SEO:
            - Buat title SEO yang relevan.
            - Buat meta description yang menarik.
            - Gunakan heading hierarchy yang benar: satu H1, lalu H2/H3 seperlunya.
            - Masukkan keyword natural dari nama produk, fitur, target audience, dan USP.
            - Sertakan schema.org JSON-LD inline jika relevan.

            Hasil akhir harus hanya valid JSON sesuai format yang diminta.
        PROMPT;
    }

    private function buildVariantRegeneratePrompt(array $variant, string $section, string $instructionPrompt): string
    {
        $salesPage = $variant['sales_page'] ?? [];
        $productName = (string) ($salesPage['product_name'] ?? '');
        $productDescription = (string) ($salesPage['product_description'] ?? '');
        $features = implode(', ', (array) ($salesPage['key_features'] ?? []));
        $targetAudience = (string) ($salesPage['target_audience'] ?? 'General');
        $price = (string) ($salesPage['price'] ?? 'Contact us');
        $usp = (string) ($salesPage['unique_selling_points'] ?? 'N/A');
        $currentHtml = (string) ($variant['plain_html'] ?? '');

        return <<<PROMPT
            Kamu adalah editor landing page HTML.
            Tugas: perbarui HANYA section "{$section}" dari HTML berikut, dan ikuti instruksi custom user.

            INPUT KONTEN:
            - nama produk/layanan: {$productName}
            - deskripsi produk: {$productDescription}
            - fitur: {$features}
            - target audience: {$targetAudience}
            - harga: {$price}
            - unique selling points: {$usp}

            INSTRUKSI USER UNTUK SECTION:
            {$instructionPrompt}

            HTML SAAT INI:
            {$currentHtml}

            ATURAN:
            - Pertahankan desain visual, struktur, dan style semaksimal mungkin.
            - Ubah hanya konten/elemen yang berhubungan dengan section "{$section}".
            - Kembalikan full HTML document lengkap.
            - Output HARUS valid JSON saja (tanpa markdown), format:
            {
              "plain_html": "full html document"
            }
        PROMPT;
    }

    private function normalizeGeminiOutput(array $result, array $input): array
    {
        $detectedLanguage = $this->normalizeLanguage($result['detected_language'] ?? null, $input);
        $variants = $result['variants'] ?? null;

        if (! is_array($variants) || count($variants) !== 4) {
            throw new RuntimeException('Gagal generate sales page: Gemini harus mengembalikan tepat 4 variasi HTML.');
        }

        $normalizedVariants = collect($variants)
            ->values()
            ->map(function ($variant, int $index) {
                $item = (array) $variant;

                $label = trim((string) ($item['label'] ?? ''));
                if ($label === '') {
                    throw new RuntimeException('Gagal generate sales page: label variant ke-'.($index + 1).' kosong.');
                }

                $plainHtml = trim((string) ($item['plain_html'] ?? ''));
                if (! $this->isFullHtmlDocument($plainHtml)) {
                    throw new RuntimeException('Gagal generate sales page: plain_html variant ke-'.($index + 1).' tidak valid.');
                }

                return [
                    'label' => $label,
                    'plain_html' => $plainHtml,
                ];
            })
            ->all();

        return [
            'detected_language' => $detectedLanguage,
            'variants' => $normalizedVariants,
        ];
    }

    private function isFullHtmlDocument(string $html): bool
    {
        $normalized = strtolower($html);

        return str_contains($normalized, '<!doctype html')
            && str_contains($normalized, '<html')
            && str_contains($normalized, '<head')
            && str_contains($normalized, '<body')
            && str_contains($normalized, '<title')
            && str_contains($normalized, '<style');
    }

    private function normalizeLanguage(mixed $language, array $input): string
    {
        $normalized = strtolower(trim((string) $language));

        if (in_array($normalized, ['id', 'en'], true)) {
            return $normalized;
        }

        return $this->detectInputLanguage($input);
    }

    private function detectInputLanguage(array $input): string
    {
        $text = ' '.strtolower(trim(implode(' ', [
            $input['product_name'] ?? '',
            $input['product_description'] ?? '',
            implode(' ', $input['key_features'] ?? []),
            $input['target_audience'] ?? '',
            $input['unique_selling_points'] ?? '',
        ]))).' ';

        $indonesianSignals = [
            ' dan ',
            ' untuk ',
            ' dengan ',
            ' yang ',
            ' harga ',
            ' mulai ',
            ' fitur ',
            ' keunggulan ',
            ' lebih ',
            ' tim ',
        ];

        $score = 0;
        foreach ($indonesianSignals as $signal) {
            if (str_contains($text, $signal)) {
                $score++;
            }
        }

        return $score >= 2 ? 'id' : 'en';
    }

    private function syncQuotaInfo(int $userId, mixed $usageToken): void
    {
        if ($usageToken === null) {
            return;
        }

        $account = GeminiAccount::getSettingsByUserId($userId);
        if (! $account) {
            return;
        }

        $usage = max((int) $usageToken, 0);
        $now = now();
        $currentQuota = (int) ($account['tpm'] ?? 250000);
        $lastSyncedAt = $account['last_quota_synced_at'] ? Carbon::parse($account['last_quota_synced_at']) : null;
        $isWithinOneMinute = $lastSyncedAt !== null && $lastSyncedAt->diffInSeconds($now) < 60;

        $baseQuota = $isWithinOneMinute ? $currentQuota : 250000;

        $currentRpm = (int) ($account['rpm'] ?? 5);
        $currentRpd = (int) ($account['rpd'] ?? 20);
        $rpmBase = $isWithinOneMinute ? $currentRpm : 5;
        $isSameDay = $lastSyncedAt !== null && $lastSyncedAt->isSameDay($now);
        $rpdBase = $isSameDay ? $currentRpd : 20;

        DB::table('gemini_accounts')
            ->where('user_id', $userId)
            ->update([
                'tpm' => max($baseQuota - $usage, 0),
                'rpm' => max($rpmBase - 1, 0),
                'rpd' => max($rpdBase - 1, 0),
                'last_quota_synced_at' => $now,
                'updated_at' => $now,
            ]);
    }
}
