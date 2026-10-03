<?php

namespace App\Http\Requests\Admin;

use App\Enums\RoomStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoomRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'room_type_id' => ['required', 'integer', 'exists:room_types,id'],
            'number' => ['required', 'string', 'max:20', Rule::unique('rooms')->ignore($this->route('room'))],
            'floor' => ['required', 'integer', 'min:0', 'max:200'],
            'status' => ['required', Rule::enum(RoomStatus::class)],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
