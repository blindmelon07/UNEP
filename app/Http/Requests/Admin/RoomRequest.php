<?php

namespace App\Http\Requests\Admin;

use App\Enums\ReservationStatus;
use App\Enums\RoomStatus;
use App\Models\Room;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class RoomRequest extends FormRequest
{
    /**
     * Get the validation rules. Occupancy is only set by check-in and cleared by check-out.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isOccupied = $this->existingRoom()?->status === RoomStatus::Occupied;

        return [
            'room_type_id' => ['required', 'integer', 'exists:room_types,id'],
            'number' => ['required', 'string', 'max:20', Rule::unique('rooms')->ignore($this->route('room'))],
            'floor' => ['required', 'integer', 'min:0', 'max:200'],
            'status' => ['required', $isOccupied
                ? Rule::in([RoomStatus::Occupied->value])
                : Rule::enum(RoomStatus::class)->except([RoomStatus::Occupied])],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Keep a room's type fixed while bookings of the old type are assigned to it.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $room = $this->existingRoom();

                if ($room === null || $validator->errors()->has('room_type_id') || $this->integer('room_type_id') === $room->room_type_id) {
                    return;
                }

                if ($room->reservations()->whereIn('status', ReservationStatus::blocking())->exists()) {
                    $validator->errors()->add('room_type_id', 'This room has upcoming or in-house bookings. Move them to another room before changing its type.');
                }
            },
        ];
    }

    /**
     * Get the custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.in' => 'This room is occupied. Check the guest out to change its status.',
            'status.enum' => 'Rooms become occupied only through check-in.',
        ];
    }

    /**
     * Get the room being edited, if any.
     */
    private function existingRoom(): ?Room
    {
        $room = $this->route('room');

        return $room instanceof Room ? $room : null;
    }
}
