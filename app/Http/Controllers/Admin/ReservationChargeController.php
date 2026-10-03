<?php

namespace App\Http\Controllers\Admin;

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

        if ($reservation->status->isClosed()) {
            Inertia::flash('error', 'Charges cannot be added to a closed reservation.');

            return back();
        }

        $reservation->charges()->create($validated);

        Inertia::flash('success', 'Charge added.');

        return back();
    }

    /**
     * Remove an extra charge, while the stay is still open.
     */
    public function destroy(ReservationCharge $charge): RedirectResponse
    {
        if ($charge->reservation->status->isClosed()) {
            Inertia::flash('error', 'Charges on a closed reservation cannot be removed.');

            return back();
        }

        $charge->delete();

        Inertia::flash('success', 'Charge removed.');

        return back();
    }
}
