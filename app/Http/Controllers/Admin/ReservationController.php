<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PaymentMethod;
use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReservationRequest;
use App\Models\Guest;
use App\Models\Reservation;
use App\Models\RoomType;
use App\Services\ReservationBooker;
use App\Services\RoomAvailability;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    /**
     * List reservations with status, date and keyword filters.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::enum(ReservationStatus::class)],
            'date' => ['nullable', 'date'],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        return Inertia::render('admin/reservations/index', [
            'reservations' => Reservation::query()
                ->with(['guest:id,first_name,last_name', 'roomType:id,name', 'room:id,number'])
                ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
                ->when($filters['date'] ?? null, fn (Builder $query, string $date) => $query
                    ->whereDate('check_in', '<=', $date)
                    ->whereDate('check_out', '>=', $date))
                ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(fn (Builder $query) => $query
                    ->where('code', 'like', "%{$search}%")
                    ->orWhereHas('guest', fn (Builder $query) => $query
                        ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%"))))
                ->latest('check_in')
                ->paginate(20)
                ->withQueryString(),
            'filters' => $filters,
            'statuses' => ReservationStatus::options(),
        ]);
    }

    /**
     * Show the walk-in / phone booking form, optionally for an existing guest.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('admin/reservations/create', [
            'guest' => $request->integer('guest_id') ? Guest::query()->find($request->integer('guest_id')) : null,
            'roomTypes' => RoomType::query()->orderBy('base_rate')->get(['id', 'name', 'base_rate', 'capacity']),
            'sources' => ReservationSource::options(),
        ]);
    }

    /**
     * Store a confirmed staff-made reservation.
     */
    public function store(ReservationRequest $request, ReservationBooker $booker): RedirectResponse
    {
        $guest = $request->filled('guest_id')
            ? Guest::query()->findOrFail($request->integer('guest_id'))
            : Guest::create($request->validated('guest'));

        $reservation = $booker->create(
            $guest,
            RoomType::query()->findOrFail($request->integer('room_type_id')),
            $request->stayDetails(),
            ReservationSource::from($request->validated('source')),
            ReservationStatus::Confirmed,
        );

        Inertia::flash('success', "Reservation {$reservation->code} created.");

        return to_route('admin.reservations.show', $reservation);
    }

    /**
     * Show a reservation with its folio and room assignment options.
     */
    public function show(Reservation $reservation, RoomAvailability $availability): Response
    {
        $reservation->load(['guest', 'roomType', 'room', 'charges', 'payments.receivedBy:id,name']);

        return Inertia::render('admin/reservations/show', [
            'reservation' => $reservation,
            'folio' => [
                'nights' => $reservation->nights(),
                'charges_total' => (float) $reservation->charges->sum('amount'),
                'grand_total' => $reservation->grandTotal(),
                'paid' => $reservation->amountPaid(),
                'balance' => $reservation->balance(),
            ],
            'assignableRooms' => $reservation->status->isEditable()
                ? $availability->assignableRooms($reservation->roomType, $reservation->check_in, $reservation->check_out, $reservation->id)
                    ->map->only(['id', 'number', 'floor', 'status'])
                : [],
            'paymentMethods' => PaymentMethod::options(),
        ]);
    }

    /**
     * Show the form for changing a reservation's stay details.
     */
    public function edit(Reservation $reservation, RoomAvailability $availability): Response|RedirectResponse
    {
        if (! $reservation->status->isEditable()) {
            Inertia::flash('error', 'Only pending or confirmed reservations can be edited.');

            return to_route('admin.reservations.show', $reservation);
        }

        return Inertia::render('admin/reservations/edit', [
            'reservation' => $reservation->load('guest:id,first_name,last_name'),
            'roomTypes' => RoomType::query()->orderBy('base_rate')->get(['id', 'name', 'base_rate', 'capacity']),
            'assignableRooms' => $availability->assignableRooms($reservation->roomType, $reservation->check_in, $reservation->check_out, $reservation->id)
                ->map->only(['id', 'number', 'room_type_id']),
        ]);
    }

    /**
     * Update a reservation's stay details.
     */
    public function update(ReservationRequest $request, Reservation $reservation, ReservationBooker $booker): RedirectResponse
    {
        if (! $reservation->status->isEditable()) {
            Inertia::flash('error', 'Only pending or confirmed reservations can be edited.');

            return to_route('admin.reservations.show', $reservation);
        }

        $booker->update(
            $reservation,
            RoomType::query()->findOrFail($request->integer('room_type_id')),
            $request->stayDetails(),
        );

        Inertia::flash('success', 'Reservation updated.');

        return to_route('admin.reservations.show', $reservation);
    }
}
