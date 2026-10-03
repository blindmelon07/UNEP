<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Record a payment against a reservation's folio.
     */
    public function store(Request $request, Reservation $reservation): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:9999999'],
            'method' => ['required', Rule::enum(PaymentMethod::class)],
            'reference' => ['nullable', 'string', 'max:100'],
        ]);

        if ($reservation->status->isClosed()) {
            Inertia::flash('error', 'This reservation is closed; its folio can no longer change.');

            return back();
        }

        $reservation->payments()->create([
            ...$validated,
            'received_by' => $request->user()->id,
            'paid_at' => now(),
        ]);

        Inertia::flash('success', 'Payment recorded.');

        return back();
    }

    /**
     * Void a payment entered by mistake, while the stay is still open.
     */
    public function destroy(Payment $payment): RedirectResponse
    {
        if ($payment->reservation->status->isClosed()) {
            Inertia::flash('error', 'Payments on a closed reservation cannot be voided.');

            return back();
        }

        $payment->delete();

        Inertia::flash('success', 'Payment removed.');

        return back();
    }
}
