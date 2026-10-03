<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BookingRequest extends FormRequest
{
    /**
     * Get the validation rules for a public online booking.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in', 'before_or_equal:'.now()->addYear()->toDateString()],
            'adults' => ['required', 'integer', 'min:1', 'max:10'],
            'children' => ['nullable', 'integer', 'min:0', 'max:10'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'special_requests' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get the stay details passed to the booker.
     *
     * @return array{check_in: string, check_out: string, adults: int, children: int, special_requests: string|null}
     */
    public function stayDetails(): array
    {
        return [
            'check_in' => $this->string('check_in')->toString(),
            'check_out' => $this->string('check_out')->toString(),
            'adults' => $this->integer('adults'),
            'children' => $this->integer('children'),
            'special_requests' => $this->validated('special_requests'),
        ];
    }
}
