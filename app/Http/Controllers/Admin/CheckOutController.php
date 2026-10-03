<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReservationStatus;
use App\Enums\RoomStatus;
use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Number;
use Inertia\Inertia;

class CheckOutController extends Controller
{
    /**
     * Check the guest out once the folio is settled, and send the room to housekeeping.
     */
    public function store(Reservation $reservation): RedirectResponse
    {
        if ($reservation->status !== ReservationStatus::CheckedIn) {
            Inertia::flash('error', 'Only checked-in reservations can be checked out.');

            return back();
        }

        $balance = $reservation->balance();

        if ($balance > 0) {
            Inertia::flash('error', 'Settle the outstanding balance of '.Number::currency($balance, 'PHP').' before check-out.');

            return back();
        }

        DB::transaction(function () use ($reservation): void {
            $reservation->update([
                'status' => ReservationStatus::CheckedOut,
                'checked_out_at' => now(),
            ]);

            $reservation->room?->update(['status' => RoomStatus::Cleaning]);
        });

        Inertia::flash('success', "{$reservation->guest->full_name} checked out.");

        return back();
    }
}
