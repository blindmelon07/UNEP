<?php

namespace App\Http\Controllers;

use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use App\Http\Requests\BookingRequest;
use App\Http\Requests\StayRequest;
use App\Models\Guest;
use App\Models\Reservation;
use App\Models\RoomType;
use App\Services\ReservationBooker;
use App\Services\RoomAvailability;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    /**
     * Session key holding the booking codes created by this visitor.
     */
    private const string BOOKED_CODES_KEY = 'booking.codes';

    /**
     * Search room availability for a stay.
     */
    public function index(Request $request, RoomAvailability $availability): Response
    {
        if (! $request->filled(['check_in', 'check_out', 'guests'])) {
            return Inertia::render('public/booking/search', [
                'filters' => null,
                'roomTypes' => [],
            ]);
        }

        $stay = $request->validate((new StayRequest)->rules());

        return Inertia::render('public/booking/search', [
            'filters' => $stay,
            'roomTypes' => $availability->availableRoomTypes(
                Carbon::parse($stay['check_in']),
                Carbon::parse($stay['check_out']),
                (int) $stay['guests'],
            ),
        ]);
    }

    /**
     * Show the guest details form for a chosen room type and stay.
     */
    public function create(StayRequest $request, RoomType $roomType, RoomAvailability $availability): Response
    {
        $checkIn = Carbon::parse($request->validated('check_in'));
        $checkOut = Carbon::parse($request->validated('check_out'));
        $nights = Reservation::nightsBetween($checkIn, $checkOut);

        return Inertia::render('public/booking/create', [
            'roomType' => $roomType,
            'stay' => [
                ...$request->validated(),
                'nights' => $nights,
                'total' => round((float) $roomType->base_rate * $nights, 2),
                'available_rooms' => $availability->availableCount($roomType, $checkIn, $checkOut),
            ],
        ]);
    }

    /**
     * Place an online booking, held as pending until the front desk confirms it.
     */
    public function store(BookingRequest $request, RoomType $roomType, ReservationBooker $booker): RedirectResponse
    {
        $guest = Guest::query()->firstOrCreate(
            ['email' => $request->validated('email'), 'last_name' => $request->validated('last_name')],
            $request->safe()->only(['first_name', 'last_name', 'email', 'phone']),
        );

        $reservation = $booker->create(
            $guest,
            $roomType,
            $request->stayDetails(),
            ReservationSource::Online,
            ReservationStatus::Pending,
        );

        $request->session()->push(self::BOOKED_CODES_KEY, $reservation->code);

        return to_route('booking.show', $reservation->code);
    }

    /**
     * Show the confirmation for a booking made in this browser session.
     */
    public function show(Request $request, Reservation $reservation): Response
    {
        abort_unless(
            in_array($reservation->code, $request->session()->get(self::BOOKED_CODES_KEY, []), true),
            404,
        );

        return Inertia::render('public/booking/show', [
            'reservation' => $reservation->load(['guest:id,first_name,last_name,email', 'roomType:id,name']),
        ]);
    }
}
