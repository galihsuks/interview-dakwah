<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSalesPageRequest;
use App\Http\Requests\UpdateSalesPageRequest;
use App\Models\SalesPage;
use App\Services\SalesPageGenerator;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response;

class SalesPageController extends Controller
{
    public function __construct(private readonly SalesPageGenerator $generator)
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $salesPages = SalesPage::query()
            ->where('user_id', auth()->id())
            ->with('htmlVariants')
            ->latest()
            ->get();

        return response()->json($salesPages);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSalesPageRequest $request): JsonResponse
    {
        $validated = $request->validated();
        try {
            $generated = $this->generator->generate($validated, $request->user());

            $salesPage = DB::transaction(function () use ($request, $validated, $generated) {
                $salesPage = SalesPage::create([
                    'user_id' => $request->user()->id,
                    'product_name' => $validated['product_name'],
                    'product_description' => $validated['product_description'],
                    'key_features' => $validated['key_features'] ?? [],
                    'target_audience' => $validated['target_audience'] ?? null,
                    'price' => $validated['price'] ?? null,
                    'unique_selling_points' => $validated['unique_selling_points'] ?? null,
                    'detected_language' => $generated['detected_language'],
                ]);

                $this->replaceHtmlVariants($salesPage, $generated['variants']);

                return $salesPage->load('htmlVariants');
            });

            return response()->json($salesPage, Response::HTTP_CREATED);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (QueryException) {
            return response()->json([
                'message' => 'Gagal menyimpan sales page ke database.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(SalesPage $salesPage): JsonResponse
    {
        $this->abortIfNotOwnedByAuthUser($salesPage);

        return response()->json($salesPage->load('htmlVariants'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSalesPageRequest $request, SalesPage $salesPage): JsonResponse
    {
        $this->abortIfNotOwnedByAuthUser($salesPage);

        $validated = $request->validated();
        try {
            $generated = $this->generator->generate($validated, $request->user());
            $updatedSalesPage = DB::transaction(function () use ($salesPage, $validated, $generated) {

                $salesPage->update([
                    'product_name' => $validated['product_name'],
                    'product_description' => $validated['product_description'],
                    'key_features' => $validated['key_features'] ?? [],
                    'target_audience' => $validated['target_audience'] ?? null,
                    'price' => $validated['price'] ?? null,
                    'unique_selling_points' => $validated['unique_selling_points'] ?? null,
                    'detected_language' => $generated['detected_language'],
                ]);

                $this->replaceHtmlVariants($salesPage, $generated['variants']);

                return $salesPage->fresh()->load('htmlVariants');
            });

            return response()->json($updatedSalesPage);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (QueryException) {
            return response()->json([
                'message' => 'Gagal memperbarui sales page di database.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SalesPage $salesPage): Response
    {
        $this->abortIfNotOwnedByAuthUser($salesPage);
        $salesPage->delete();

        return response()->noContent();
    }

    private function abortIfNotOwnedByAuthUser(SalesPage $salesPage): void
    {
        abort_unless($salesPage->user_id === auth()->id(), Response::HTTP_FORBIDDEN);
    }

    /**
     * @param array<int, array{label:string, plain_html:string}> $variants
     */
    private function replaceHtmlVariants(SalesPage $salesPage, array $variants): void
    {
        $salesPage->htmlVariants()->delete();
        $salesPage->htmlVariants()->createMany($variants);
    }
}
