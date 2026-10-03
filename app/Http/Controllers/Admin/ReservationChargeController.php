<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReservationStatus;
use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\ReservationCharge;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationChargeController extends Controller
{
    /**
     * Add an extra charge (minibar, laundry, etc.) to a reservation's folio.
     */
    public function store(Request $request, Reservation $reservation): RedirectResponse
    {
        $validated = $request->validate([
            'description' => ['required', 'string', 'max:150'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:9999999'],
        ]);

        if (in_array($reservation->status, [ReservationStatus::CheckedOut, ReservationStatus::Cancelled], true)) {
            Inertia::flash('error', 'Charges cannot be added to a closed reservation.');

            return back();
        }

        $reservation->charges()->create($validated);

        Inertia::flash('success', 'Charge added.');

        return back();
    }

    /**
     * Remove an extra charge.
     */
    public function destroy(ReservationCharge $charge): RedirectResponse
    {
        $charge->delete();

        Inertia::flash('success', 'Charge removed.');

        return back();
    }
}
