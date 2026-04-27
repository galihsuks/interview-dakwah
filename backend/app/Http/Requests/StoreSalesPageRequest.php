<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSalesPageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'product_name' => ['required', 'string', 'max:255'],
            'product_description' => ['required', 'string', 'max:3000'],
            'key_features' => ['nullable', 'array'],
            'key_features.*' => ['required', 'string', 'max:255'],
            'target_audience' => ['nullable', 'string', 'max:255'],
            'price' => ['nullable', 'string', 'max:100'],
            'unique_selling_points' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
