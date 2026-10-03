<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReservationStatus;
use App\Enums\RoomStatus;
use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CheckInController extends Controller
{
    /**
     * Check the guest in to their assigned, ready room.
     */
    public function store(Reservation $reservation): RedirectResponse
    {
        $problem = match (true) {
            ! $reservation->status->isEditable() => 'Only pending or confirmed reservations can be checked in.',
            $reservation->room === null => 'Assign a room before checking the guest in.',
            $reservation->check_in->isAfter(today()) => 'This reservation starts on '.$reservation->check_in->toFormattedDateString().'.',
            $reservation->room->status !== RoomStatus::Available => "Room {$reservation->room->number} is not ready ({$reservation->room->status->label()}).",
            default => null,
        };

        if ($problem !== null) {
            Inertia::flash('error', $problem);

            return back();
        }

        DB::transaction(function () use ($reservation): void {
            $reservation->update([
                'status' => ReservationStatus::CheckedIn,
                'checked_in_at' => now(),
            ]);

            $reservation->room->update(['status' => RoomStatus::Occupied]);
        });

        Inertia::flash('success', "{$reservation->guest->full_name} checked in to room {$reservation->room->number}.");

        return back();
    }
}
