<?php

use App\Enums\ReservationStatus;
use App\Enums\Role;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\ReservationCharge;
use App\Models\User;

beforeEach(function () {
    $this->frontDesk = User::factory()->role(Role::FrontDesk)->create();
});

it('voids a payment while the stay is still open', function () {
    $payment = Payment::factory()->for(Reservation::factory()->status(ReservationStatus::CheckedIn))->create();

    $this->actingAs($this->frontDesk)->delete(route('admin.payments.destroy', $payment));

    $this->assertModelMissing($payment);
});

it('keeps the folio of a closed reservation unchanged', function (ReservationStatus $status) {
    $reservation = Reservation::factory()->status($status)->create();
    $payment = Payment::factory()->for($reservation)->create();
    $charge = ReservationCharge::factory()->for($reservation)->create();

    $this->actingAs($this->frontDesk)->delete(route('admin.payments.destroy', $payment))
        ->assertInertiaFlash('error', 'Payments on a closed reservation cannot be voided.');
    $this->actingAs($this->frontDesk)->delete(route('admin.charges.destroy', $charge))
        ->assertInertiaFlash('error', 'Charges on a closed reservation cannot be removed.');
    $this->actingAs($this->frontDesk)->post(route('admin.reservations.payments.store', $reservation), ['amount' => 100, 'method' => 'cash'])
        ->assertInertiaFlash('error', 'This reservation is closed; its folio can no longer change.');

    $this->assertModelExists($payment);
    $this->assertModelExists($charge);
    expect($reservation->payments()->count())->toBe(1);
})->with([ReservationStatus::CheckedOut, ReservationStatus::Cancelled]);
