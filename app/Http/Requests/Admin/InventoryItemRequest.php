<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InventoryItemRequest extends FormRequest
{
    /**
     * Get the validation rules; the opening quantity is only accepted when creating.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'inventory_category_id' => ['required', 'integer', 'exists:inventory_categories,id'],
            'sku' => ['required', 'string', 'max:50', Rule::unique('inventory_items')->ignore($this->route('inventory_item'))],
            'name' => ['required', 'string', 'max:150'],
            'unit' => ['required', 'string', 'max:20'],
            'reorder_level' => ['required', 'integer', 'min:0', 'max:1000000'],
            'unit_cost' => ['required', 'numeric', 'min:0', 'max:9999999'],
            'location' => ['nullable', 'string', 'max:100'],
            'opening_quantity' => [Rule::excludeIf(! $this->isMethod('post')), 'nullable', 'integer', 'min:0', 'max:1000000'],
        ];
    }
}
