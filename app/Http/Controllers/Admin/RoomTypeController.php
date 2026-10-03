<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RoomTypeRequest;
use App\Models\RoomType;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RoomTypeController extends Controller
{
    /**
     * List room types with their room counts.
     */
    public function index(): Response
    {
        return Inertia::render('admin/room-types/index', [
            'roomTypes' => RoomType::query()->withCount('rooms')->orderBy('base_rate')->get(),
        ]);
    }

    /**
     * Show the form for a new room type.
     */
    public function create(): Response
    {
        return Inertia::render('admin/room-types/form', ['roomType' => null]);
    }

    /**
     * Store a new room type.
     */
    public function store(RoomTypeRequest $request): RedirectResponse
    {
        RoomType::create($request->validated());

        Inertia::flash('success', 'Room type created.');

        return to_route('admin.room-types.index');
    }

    /**
     * Show the form for editing a room type.
     */
    public function edit(RoomType $roomType): Response
    {
        return Inertia::render('admin/room-types/form', ['roomType' => $roomType]);
    }

    /**
     * Update a room type.
     */
    public function update(RoomTypeRequest $request, RoomType $roomType): RedirectResponse
    {
        $roomType->update($request->validated());

        Inertia::flash('success', 'Room type updated.');

        return to_route('admin.room-types.index');
    }

    /**
     * Delete a room type that has no rooms or bookings.
     */
    public function destroy(RoomType $roomType): RedirectResponse
    {
        if ($roomType->rooms()->exists() || $roomType->reservations()->exists()) {
            Inertia::flash('error', 'Room types with rooms or reservations cannot be deleted.');

            return back();
        }

        $roomType->delete();

        Inertia::flash('success', 'Room type deleted.');

        return to_route('admin.room-types.index');
    }
}
