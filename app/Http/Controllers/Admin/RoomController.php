<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReservationStatus;
use App\Enums\RoomStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RoomRequest;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    /**
     * List rooms, optionally filtered by status or room type.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::enum(RoomStatus::class)],
            'room_type_id' => ['nullable', 'integer'],
        ]);

        return Inertia::render('admin/rooms/index', [
            'rooms' => Room::query()
                ->with('roomType:id,name')
                ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
                ->when($filters['room_type_id'] ?? null, fn ($query, $roomTypeId) => $query->where('room_type_id', $roomTypeId))
                ->orderBy('floor')
                ->orderBy('number')
                ->get(),
            'filters' => $filters,
            'roomTypes' => RoomType::query()->orderBy('name')->get(['id', 'name']),
            'statuses' => RoomStatus::options(),
        ]);
    }

    /**
     * Show the form for a new room.
     */
    public function create(): Response
    {
        return $this->form(null);
    }

    /**
     * Store a new room.
     */
    public function store(RoomRequest $request): RedirectResponse
    {
        Room::create($request->validated());

        Inertia::flash('success', 'Room created.');

        return to_route('admin.rooms.index');
    }

    /**
     * Show the form for editing a room.
     */
    public function edit(Room $room): Response
    {
        return $this->form($room);
    }

    /**
     * Update a room.
     */
    public function update(RoomRequest $request, Room $room): RedirectResponse
    {
        $room->update($request->validated());

        Inertia::flash('success', 'Room updated.');

        return to_route('admin.rooms.index');
    }

    /**
     * Delete a room that has no active bookings.
     */
    public function destroy(Room $room): RedirectResponse
    {
        if ($room->reservations()->whereIn('status', ReservationStatus::blocking())->exists()) {
            Inertia::flash('error', 'This room has active reservations and cannot be deleted.');

            return back();
        }

        $room->delete();

        Inertia::flash('success', 'Room deleted.');

        return to_route('admin.rooms.index');
    }

    /**
     * Render the shared create/edit form.
     */
    private function form(?Room $room): Response
    {
        return Inertia::render('admin/rooms/form', [
            'room' => $room,
            'roomTypes' => RoomType::query()->orderBy('name')->get(['id', 'name']),
            'statuses' => RoomStatus::options(),
        ]);
    }
}
