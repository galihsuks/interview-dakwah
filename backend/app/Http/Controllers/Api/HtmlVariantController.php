<?php

namespace App\Http\Controllers\Api;

use App\Models\HtmlVariant;
use App\Services\SalesPageGenerator;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class HtmlVariantController extends BaseApiController
{
    public function __construct(private readonly SalesPageGenerator $generator)
    {
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $variant = HtmlVariant::findByIdAndUserId($id, (int) $request->user()->id);
        if (! $variant) {
            return $this->notFound('HTML variant tidak ditemukan.');
        }

        return $this->success('HTML variant loaded.', $variant);
    }

    public function regenerateSection(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'section' => ['required', 'string', 'in:headline,subheadline,problem,solution,features,benefits,usp,pricing,testimonial,faq,cta,footer'],
            'prompt' => ['required', 'string', 'max:5000'],
        ]);

        $userId = (int) $request->user()->id;
        $variant = HtmlVariant::findByIdAndUserId($id, $userId);
        if (! $variant) {
            return $this->notFound('HTML variant tidak ditemukan.');
        }

        try {
            $updatedHtml = $this->generator->regenerateVariantSection(
                $variant,
                (string) $validated['section'],
                (string) $validated['prompt'],
                $request->user()
            );

            $updatedVariant = HtmlVariant::updatePlainHtmlByIdAndUserId($id, $userId, $updatedHtml);
            if (! $updatedVariant) {
                return $this->notFound('HTML variant tidak ditemukan.');
            }

            return $this->success('Section HTML variant berhasil diregenerate.', $updatedVariant);
        } catch (RuntimeException $exception) {
            return $this->unprocessable($exception->getMessage());
        } catch (QueryException) {
            return $this->serverError('Gagal mengupdate HTML variant di database.');
        }
    }
}
