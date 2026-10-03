<?php

namespace App\Http\Controllers\Admin;

use App\Enums\MaintenanceStatus;
use App\Enums\ReservationStatus;
use App\Enums\RoomStatus;
use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\InventoryItem;
use App\Models\MaintenanceRequest;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\Shift;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the staff dashboard with a summary for each module the user can access.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('admin/dashboard', [
            'frontDesk' => $user->canAccessModule('reservations') ? $this->frontDeskSummary() : null,
            'inventory' => $user->canAccessModule('inventory') ? $this->inventorySummary() : null,
            'maintenance' => $user->canAccessModule('maintenance') ? $this->maintenanceSummary() : null,
            'staff' => $user->canAccessModule('employees') ? $this->staffSummary() : null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function frontDeskSummary(): array
    {
        $today = today()->toDateString();
        $roomCounts = Room::query()->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');
        $totalRooms = (int) $roomCounts->sum();

        return [
            'arrivals' => Reservation::query()
                ->with(['guest:id,first_name,last_name', 'roomType:id,name', 'room:id,number'])
                ->whereDate('check_in', $today)
                ->whereIn('status', [ReservationStatus::Pending, ReservationStatus::Confirmed])
                ->orderBy('id')
                ->get(),
            'departures' => Reservation::query()
                ->with(['guest:id,first_name,last_name', 'room:id,number'])
                ->whereDate('check_out', $today)
                ->where('status', ReservationStatus::CheckedIn)
                ->orderBy('id')
                ->get(),
            'pendingOnline' => Reservation::query()->where('status', ReservationStatus::Pending)->count(),
            'roomStatus' => collect(RoomStatus::cases())->map(fn (RoomStatus $status): array => [
                'status' => $status->value,
                'label' => $status->label(),
                'count' => (int) ($roomCounts[$status->value] ?? 0),
            ]),
            'occupancyRate' => $totalRooms > 0
                ? round(((int) ($roomCounts[RoomStatus::Occupied->value] ?? 0)) / $totalRooms * 100, 1)
                : 0,
            'revenueThisMonth' => (float) Payment::query()
                ->whereBetween('paid_at', [now()->startOfMonth(), now()->endOfMonth()])
                ->sum('amount'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function inventorySummary(): array
    {
        return [
            'itemCount' => InventoryItem::query()->count(),
            'lowStockCount' => InventoryItem::query()->lowStock()->count(),
            'lowStockItems' => InventoryItem::query()->lowStock()->orderBy('quantity')->limit(6)->get(['id', 'name', 'unit', 'quantity', 'reorder_level']),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function maintenanceSummary(): array
    {
        return [
            'openCount' => MaintenanceRequest::query()->whereIn('status', MaintenanceStatus::active())->count(),
            'urgentCount' => MaintenanceRequest::query()->whereIn('status', MaintenanceStatus::active())->whereIn('priority', ['high', 'urgent'])->count(),
            'recent' => MaintenanceRequest::query()
                ->with('room:id,number')
                ->whereIn('status', MaintenanceStatus::active())
                ->latest()
                ->limit(6)
                ->get(['id', 'room_id', 'location', 'title', 'priority', 'status', 'created_at']),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function staffSummary(): array
    {
        return [
            'activeEmployees' => Employee::query()->active()->count(),
            'onShiftToday' => Shift::query()->whereDate('date', today())->count(),
        ];
    }
}
