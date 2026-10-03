<?php

namespace App\Services;

use App\Enums\MaintenanceStatus;
use App\Enums\RoomStatus;
use App\Models\Room;

class MaintenanceRoomStatus
{
    /**
     * Take a room out of sale while it has open room-blocking requests, and release it once they close.
     *
     * Occupied and out-of-service rooms are left alone so a guest stay or a manual block is never overridden.
     */
    public function sync(Room $room): void
    {
        $isBlocked = $room->maintenanceRequests()
            ->where('blocks_room', true)
            ->whereIn('status', MaintenanceStatus::active())
            ->exists();

        if ($isBlocked && in_array($room->status, [RoomStatus::Available, RoomStatus::Cleaning], true)) {
            $room->update(['status' => RoomStatus::Maintenance]);
        }

        if (! $isBlocked && $room->status === RoomStatus::Maintenance) {
            $room->update(['status' => RoomStatus::Available]);
        }
    }
}
