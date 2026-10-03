<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class RoomTypeRequest extends FormRequest
{
    /**
     * Normalise the slug and comma separated amenities before validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => Str::slug($this->input('slug') ?: $this->input('name', '')),
            'amenities' => is_string($this->input('amenities'))
                ? collect(explode(',', $this->input('amenities')))->map(fn (string $amenity): string => trim($amenity))->filter()->values()->all()
                : $this->input('amenities', []),
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:120', Rule::unique('room_types')->ignore($this->route('room_type'))],
            'description' => ['nullable', 'string', 'max:2000'],
            'base_rate' => ['required', 'numeric', 'min:0', 'max:9999999'],
            'capacity' => ['required', 'integer', 'min:1', 'max:20'],
            'amenities' => ['array'],
            'amenities.*' => ['string', 'max:60'],
            'image_url' => ['nullable', 'string', 'max:500', 'regex:/^(https?:\/\/|\/)\S+$/'],
        ];
    }
}
