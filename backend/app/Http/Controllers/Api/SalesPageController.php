<?php

namespace App\Http\Controllers\Api;

use App\Models\SalesPage;
use App\Services\SalesPageGenerator;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class SalesPageController extends BaseApiController
{
    public function __construct(private readonly SalesPageGenerator $generator)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $rows = SalesPage::getAllByUserId($userId);

        return $this->success('Sales pages loaded.', $rows);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $row = SalesPage::findOneByIdAndUserId($id, $userId);

        if (! $row) {
            return $this->notFound('Sales page tidak ditemukan.');
        }

        return $this->success('Sales page loaded.', $row);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateSalesPage($request);

        try {
            $generated = $this->generator->generate($validated, $request->user());
            $created = SalesPage::createWithVariants(
                (int) $request->user()->id,
                $validated,
                (string) $generated['detected_language'],
                (array) $generated['variants']
            );

            return $this->created('Sales page berhasil dibuat.', $created);
        } catch (RuntimeException $exception) {
            return $this->unprocessable($exception->getMessage());
        } catch (QueryException) {
            return $this->serverError('Gagal menyimpan sales page ke database.');
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $this->validateSalesPage($request);

        try {
            $generated = $this->generator->generate($validated, $request->user());
            $updated = SalesPage::updateWithVariants(
                $id,
                (int) $request->user()->id,
                $validated,
                (string) $generated['detected_language'],
                (array) $generated['variants']
            );

            if (! $updated) {
                return $this->notFound('Sales page tidak ditemukan.');
            }

            return $this->success('Sales page berhasil diupdate.', $updated);
        } catch (RuntimeException $exception) {
            return $this->unprocessable($exception->getMessage());
        } catch (QueryException) {
            return $this->serverError('Gagal mengupdate sales page di database.');
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $deleted = SalesPage::deleteByIdAndUserId($id, (int) $request->user()->id);

        if (! $deleted) {
            return $this->notFound('Sales page tidak ditemukan.');
        }

        return $this->success('Sales page berhasil dihapus.', null);
    }

    private function validateSalesPage(Request $request): array
    {
        return $request->validate([
            'product_name' => ['required', 'string', 'max:255'],
            'product_description' => ['required', 'string', 'max:3000'],
            'key_features' => ['nullable', 'array'],
            'key_features.*' => ['required', 'string', 'max:255'],
            'target_audience' => ['nullable', 'string', 'max:255'],
            'price' => ['nullable', 'string', 'max:100'],
            'unique_selling_points' => ['nullable', 'string', 'max:1000'],
        ]);
    }
}
