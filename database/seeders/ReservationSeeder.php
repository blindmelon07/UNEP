<?php

namespace Database\Seeders;

use App\Enums\PaymentMethod;
use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use App\Enums\Role;
use App\Enums\RoomStatus;
use App\Models\Guest;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Carbon\CarbonImmutable;
use Database\Seeders\Support\DemoPeople;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class ReservationSeeder extends Seeder
{
    /**
     * How many days of history and future bookings to generate.
     */
    private const int DAYS_BACK = 60;

    private const int DAYS_AHEAD = 30;

    /**
     * Extra charges a guest might run up during a stay.
     *
     * @var list<array{0: string, 1: int}>
     */
    private const array EXTRAS = [
        ['Minibar', 350], ['Room service — breakfast', 480], ['Laundry', 260], ['Extra bed', 800],
        ['Late check-out', 1000], ['Airport transfer (Naga)', 1500], ['Restaurant — dinner', 920],
    ];

    /** @var Collection<int, Guest> */
    private Collection $guests;

    /** @var Collection<int, User> */
    private Collection $clerks;

    /**
     * Create guests and a realistic, non-overlapping booking history for every room.
     */
    public function run(): void
    {
        $this->guests = $this->seedGuests(45);
        $this->clerks = User::query()->where('role', Role::FrontDesk)->where('is_active', true)->get();

        $today = CarbonImmutable::today();
        $rooms = Room::query()->with('roomType')->where('status', '!=', RoomStatus::OutOfService)->orderBy('number')->get();

        foreach ($rooms as $room) {
            $cursor = $today->subDays(self::DAYS_BACK - fake()->numberBetween(0, 3));

            while ($cursor->lessThan($today->addDays(self::DAYS_AHEAD))) {
                $nights = fake()->randomElement([1, 1, 2, 2, 2, 3, 3, 4, 5]);
                $checkIn = $cursor;
                $checkOut = $cursor->addDays($nights);

                $this->book($room, $checkIn, $checkOut, $today);

                $isFuture = $checkIn->greaterThan($today);
                $cursor = $checkOut->addDays(fake()->randomElement($isFuture ? [1, 2, 3, 4, 6] : [0, 0, 1, 1, 2, 3]));
            }
        }
    }

    /**
     * @return Collection<int, Guest>
     */
    private function seedGuests(int $count): Collection
    {
        foreach (range(1, $count) as $ignored) {
            [$firstName, $lastName] = DemoPeople::name();

            Guest::create([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => DemoPeople::email($firstName, $lastName),
                'phone' => DemoPeople::mobile(),
                'address' => fake()->randomElement(DemoPeople::CITIES),
                'id_type' => fake()->optional(0.7)->randomElement(DemoPeople::ID_TYPES),
                'id_number' => fake()->optional(0.7)->numerify('####-####-####'),
            ]);
        }

        return Guest::all();
    }

    /**
     * Create one stay, deriving its status, folio and room state from where it falls relative to today.
     */
    private function book(Room $room, CarbonImmutable $checkIn, CarbonImmutable $checkOut, CarbonImmutable $today): void
    {
        $status = $this->statusFor($checkIn, $checkOut, $today, $room->status === RoomStatus::Occupied);
        $source = $status === ReservationStatus::Pending
            ? ReservationSource::Online
            : fake()->randomElement([ReservationSource::WalkIn, ReservationSource::Phone, ReservationSource::Phone, ReservationSource::Online]);
        $rate = (float) $room->roomType->base_rate;
        $capacity = $room->roomType->capacity;
        $adults = fake()->numberBetween(1, min(2, $capacity));
        $bookedAt = $checkIn->subDays(fake()->numberBetween(0, 21))->setTime(fake()->numberBetween(8, 20), fake()->numberBetween(0, 59));

        $reservation = Reservation::query()->forceCreate([
            'code' => Reservation::generateCode(),
            'guest_id' => $this->guests->random()->id,
            'room_type_id' => $room->room_type_id,
            'room_id' => $status === ReservationStatus::Pending ? null : $room->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'adults' => $adults,
            'children' => $capacity > 2 ? fake()->numberBetween(0, $capacity - $adults) : 0,
            'status' => $status,
            'source' => $source,
            'nightly_rate' => $rate,
            'room_total' => $rate * Reservation::nightsBetween($checkIn, $checkOut),
            'special_requests' => fake()->optional(0.2)->randomElement([
                'Early check-in if possible.', 'Non-smoking room please.', 'Celebrating our anniversary.',
                'Extra pillows and towels.', 'Arriving late, around 11 PM.', 'Need a receipt for company reimbursement.',
            ]),
            'checked_in_at' => in_array($status, [ReservationStatus::CheckedIn, ReservationStatus::CheckedOut], true)
                ? $checkIn->setTime(fake()->numberBetween(13, 18), fake()->numberBetween(0, 59))
                : null,
            'checked_out_at' => $status === ReservationStatus::CheckedOut
                ? $checkOut->setTime(fake()->numberBetween(9, 11), fake()->numberBetween(0, 59))
                : null,
            'created_at' => $bookedAt->lessThan(now()) ? $bookedAt : now(),
            'updated_at' => now(),
        ]);

        $this->seedFolio($reservation, $today);

        match (true) {
            $status === ReservationStatus::CheckedIn => $room->update(['status' => RoomStatus::Occupied]),
            $status === ReservationStatus::CheckedOut && $checkOut->equalTo($today) => $room->update(['status' => RoomStatus::Cleaning]),
            default => null,
        };
    }

    /**
     * Decide the reservation status from its dates; a same-day arrival waits if the previous guest has not left.
     */
    private function statusFor(CarbonImmutable $checkIn, CarbonImmutable $checkOut, CarbonImmutable $today, bool $isRoomOccupied): ReservationStatus
    {
        if ($checkOut->lessThan($today)) {
            return fake()->boolean(92) ? ReservationStatus::CheckedOut : ReservationStatus::Cancelled;
        }

        if ($checkOut->equalTo($today)) {
            return fake()->boolean(60) ? ReservationStatus::CheckedIn : ReservationStatus::CheckedOut;
        }

        if ($checkIn->equalTo($today)) {
            return ! $isRoomOccupied && fake()->boolean(40) ? ReservationStatus::CheckedIn : ReservationStatus::Confirmed;
        }

        if ($checkIn->lessThan($today)) {
            return ReservationStatus::CheckedIn;
        }

        return fake()->randomElement([
            ReservationStatus::Confirmed, ReservationStatus::Confirmed, ReservationStatus::Confirmed,
            ReservationStatus::Confirmed, ReservationStatus::Pending, ReservationStatus::Pending,
            ReservationStatus::Cancelled,
        ]);
    }

    /**
     * Add extras and payments that make sense for the reservation's stage.
     */
    private function seedFolio(Reservation $reservation, CarbonImmutable $today): void
    {
        $hasStayed = in_array($reservation->status, [ReservationStatus::CheckedIn, ReservationStatus::CheckedOut], true);

        if ($hasStayed && fake()->boolean(40)) {
            foreach (fake()->randomElements(self::EXTRAS, fake()->numberBetween(1, 2)) as [$description, $amount]) {
                $reservation->charges()->forceCreate([
                    'description' => $description,
                    'amount' => $amount,
                    'created_at' => $reservation->checked_in_at?->copy()->addHours(fake()->numberBetween(2, 20)),
                ]);
            }
        }

        $grandTotal = (float) $reservation->room_total + (float) $reservation->charges()->sum('amount');

        match ($reservation->status) {
            ReservationStatus::CheckedOut => $this->pay($reservation, $grandTotal, $reservation->checked_out_at, fake()->boolean(50) ? $reservation->checked_in_at : null),
            ReservationStatus::CheckedIn => $this->pay($reservation, round($grandTotal / 2, 2), $reservation->checked_in_at),
            ReservationStatus::Confirmed => fake()->boolean(35)
                ? $this->pay($reservation, round((float) $reservation->room_total * 0.3, 2), $reservation->created_at, method: PaymentMethod::BankTransfer)
                : null,
            default => null,
        };
    }

    /**
     * Record payments totalling the amount, optionally split into a deposit and a balance.
     */
    private function pay(Reservation $reservation, float $amount, mixed $paidAt, mixed $depositAt = null, ?PaymentMethod $method = null): void
    {
        $parts = $depositAt !== null ? [[round($amount * 0.4, 2), $depositAt], [round($amount - round($amount * 0.4, 2), 2), $paidAt]] : [[$amount, $paidAt]];

        foreach ($parts as [$partAmount, $at]) {
            $chosenMethod = $method ?? fake()->randomElement([PaymentMethod::Cash, PaymentMethod::Cash, PaymentMethod::Card, PaymentMethod::Gcash, PaymentMethod::Gcash]);

            $reservation->payments()->create([
                'amount' => $partAmount,
                'method' => $chosenMethod,
                'reference' => $chosenMethod === PaymentMethod::Cash ? null : strtoupper(fake()->bothify('??########')),
                'received_by' => $this->clerks->random()->id,
                'paid_at' => $at ?? now(),
            ]);
        }
    }
}
