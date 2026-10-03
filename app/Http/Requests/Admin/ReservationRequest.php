<?php

namespace App\Http\Requests\Admin;

use App\Enums\ReservationSource;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReservationRequest extends FormRequest
{
    /**
     * Get the validation rules; new bookings need a guest, updates only need stay details.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isCreating = $this->isMethod('post');
        $needsNewGuest = $isCreating && ! $this->filled('guest_id');

        return [
            'room_type_id' => ['required', 'integer', 'exists:room_types,id'],
            'room_id' => ['nullable', 'integer', 'exists:rooms,id'],
            'check_in' => ['required', 'date', ...($isCreating ? ['after_or_equal:today'] : [])],
            'check_out' => ['required', 'date', 'after:check_in'],
            'adults' => ['required', 'integer', 'min:1', 'max:20'],
            'children' => ['nullable', 'integer', 'min:0', 'max:20'],
            'special_requests' => ['nullable', 'string', 'max:1000'],
            'source' => [Rule::requiredIf($isCreating), Rule::enum(ReservationSource::class)],
            'guest_id' => ['nullable', 'integer', 'exists:guests,id'],
            'guest.first_name' => [Rule::requiredIf($needsNewGuest), 'nullable', 'string', 'max:100'],
            'guest.last_name' => [Rule::requiredIf($needsNewGuest), 'nullable', 'string', 'max:100'],
            'guest.email' => [Rule::requiredIf($needsNewGuest), 'nullable', 'email', 'max:255'],
            'guest.phone' => [Rule::requiredIf($needsNewGuest), 'nullable', 'string', 'max:30'],
        ];
    }

    /**
     * Get the stay details passed to the booker.
     *
     * @return array{check_in: string, check_out: string, adults: int, children: int|null, special_requests: string|null, room_id: int|null}
     */
    public function stayDetails(): array
    {
        return [
            'check_in' => $this->validated('check_in'),
            'check_out' => $this->validated('check_out'),
            'adults' => (int) $this->validated('adults'),
            'children' => $this->validated('children') === null ? null : (int) $this->validated('children'),
            'special_requests' => $this->validated('special_requests'),
            'room_id' => $this->validated('room_id') === null ? null : (int) $this->validated('room_id'),
        ];
    }
}
