<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StayRequest extends FormRequest
{
    /**
     * Get the validation rules for a public availability search.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in', 'before_or_equal:'.now()->addYear()->toDateString()],
            'guests' => ['required', 'integer', 'min:1', 'max:10'],
        ];
    }
}
