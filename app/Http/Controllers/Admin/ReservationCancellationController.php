<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReservationStatus;
use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ReservationCancellationController extends Controller
{
    /**
     * Cancel a reservation that has not yet been checked in.
     */
    public function store(Reservation $reservation): RedirectResponse
    {
        if (! $reservation->status->isEditable()) {
            Inertia::flash('error', 'Only pending or confirmed reservations can be cancelled.');

            return back();
        }

        $reservation->update(['status' => ReservationStatus::Cancelled]);

        Inertia::flash('success', "Reservation {$reservation->code} cancelled.");

        return back();
    }
}
