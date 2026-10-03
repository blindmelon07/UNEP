<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RoomStatus;
use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RoomStatusController extends Controller
{
    /**
     * Change a room's housekeeping status. Occupancy is controlled only by check-in and check-out.
     */
    public function update(Request $request, Room $room): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(RoomStatus::class)->except([RoomStatus::Occupied])],
        ]);

        if ($room->status === RoomStatus::Occupied) {
            Inertia::flash('error', "Room {$room->number} is occupied. Check the guest out first.");

            return back();
        }

        $room->update($validated);

        Inertia::flash('success', "Room {$room->number} marked as {$room->status->label()}.");

        return back();
    }
}
