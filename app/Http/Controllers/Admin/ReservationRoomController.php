<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReservationStatus;
use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Services\RoomAvailability;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ReservationRoomController extends Controller
{
    /**
     * Assign (or reassign) a specific room to a reservation, and confirm it if it was pending.
     */
    public function update(Request $request, Reservation $reservation, RoomAvailability $availability): RedirectResponse
    {
        $validated = $request->validate([
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
        ]);

        if (! $reservation->status->isEditable()) {
            Inertia::flash('error', 'Rooms can only be assigned before check-in.');

            return back();
        }

        DB::transaction(function () use ($reservation, $availability, $validated): void {
            $roomType = $reservation->roomType()->lockForUpdate()->firstOrFail();

            $isAssignable = $availability
                ->assignableRooms($roomType, $reservation->check_in, $reservation->check_out, $reservation->id)
                ->contains('id', (int) $validated['room_id']);

            if (! $isAssignable) {
                throw ValidationException::withMessages([
                    'room_id' => 'That room is not free for this stay.',
                ]);
            }

            $reservation->update([
                'room_id' => $validated['room_id'],
                'status' => ReservationStatus::Confirmed,
            ]);
        });

        Inertia::flash('success', 'Room assigned.');

        return back();
    }
}
