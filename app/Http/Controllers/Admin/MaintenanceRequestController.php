<?php

namespace App\Http\Controllers\Admin;

use App\Enums\MaintenancePriority;
use App\Enums\MaintenanceStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MaintenanceRequestRequest;
use App\Models\Employee;
use App\Models\InventoryItem;
use App\Models\MaintenanceRequest;
use App\Models\Room;
use App\Services\MaintenanceRoomStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceRequestController extends Controller
{
    public function __construct(private MaintenanceRoomStatus $roomStatus) {}

    /**
     * List maintenance requests, open ones first.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::enum(MaintenanceStatus::class)],
            'priority' => ['nullable', Rule::enum(MaintenancePriority::class)],
        ]);

        return Inertia::render('admin/maintenance-requests/index', [
            'requests' => MaintenanceRequest::query()
                ->with(['room:id,number', 'assignee:id,first_name,last_name'])
                ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
                ->when($filters['priority'] ?? null, fn (Builder $query, string $priority) => $query->where('priority', $priority))
                ->orderByRaw("case when status in ('open', 'in_progress', 'on_hold') then 0 else 1 end")
                ->orderByRaw("case priority when 'urgent' then 0 when 'high' then 1 when 'medium' then 2 else 3 end")
                ->latest()
                ->paginate(20)
                ->withQueryString(),
            'filters' => $filters,
            'statuses' => MaintenanceStatus::options(),
            'priorities' => MaintenancePriority::options(),
        ]);
    }

    /**
     * Show the form for reporting an issue.
     */
    public function create(Request $request): Response
    {
        return $this->form(null, $request->integer('room_id') ?: null);
    }

    /**
     * Log a new maintenance request.
     */
    public function store(MaintenanceRequestRequest $request): RedirectResponse
    {
        $maintenanceRequest = DB::transaction(function () use ($request): MaintenanceRequest {
            $maintenanceRequest = MaintenanceRequest::create([
                ...$request->safe()->except(['status', 'resolution_notes']),
                'status' => MaintenanceStatus::Open,
                'reported_by' => $request->user()->id,
            ]);

            $this->syncRoom($maintenanceRequest);

            return $maintenanceRequest;
        });

        Inertia::flash('success', 'Maintenance request logged.');

        return to_route('admin.maintenance-requests.show', $maintenanceRequest);
    }

    /**
     * Show a request with the parts used on it.
     */
    public function show(MaintenanceRequest $maintenanceRequest): Response
    {
        return Inertia::render('admin/maintenance-requests/show', [
            'request' => $maintenanceRequest->load([
                'room:id,number,status',
                'reporter:id,name',
                'assignee:id,first_name,last_name',
                'partsUsed.item:id,name,unit',
            ]),
            'inventoryItems' => InventoryItem::query()->where('quantity', '>', 0)->orderBy('name')->get(['id', 'name', 'unit', 'quantity']),
        ]);
    }

    /**
     * Show the form for updating a request.
     */
    public function edit(MaintenanceRequest $maintenanceRequest): Response
    {
        return $this->form($maintenanceRequest, null);
    }

    /**
     * Update a request, stamping the resolution time when it is closed.
     */
    public function update(MaintenanceRequestRequest $request, MaintenanceRequest $maintenanceRequest): RedirectResponse
    {
        DB::transaction(function () use ($request, $maintenanceRequest): void {
            $previousRoom = $maintenanceRequest->room;
            $status = MaintenanceStatus::from($request->validated('status'));

            $maintenanceRequest->update([
                ...$request->validated(),
                'resolved_at' => $status->isClosed() ? ($maintenanceRequest->resolved_at ?? now()) : null,
            ]);

            if ($previousRoom !== null && $previousRoom->id !== $maintenanceRequest->room_id) {
                $this->roomStatus->sync($previousRoom);
            }

            $this->syncRoom($maintenanceRequest->refresh());
        });

        Inertia::flash('success', 'Maintenance request updated.');

        return to_route('admin.maintenance-requests.show', $maintenanceRequest);
    }

    /**
     * Delete a request and release its room if it was blocking it.
     */
    public function destroy(MaintenanceRequest $maintenanceRequest): RedirectResponse
    {
        DB::transaction(function () use ($maintenanceRequest): void {
            $room = $maintenanceRequest->room;
            $maintenanceRequest->delete();

            if ($room !== null) {
                $this->roomStatus->sync($room);
            }
        });

        Inertia::flash('success', 'Maintenance request deleted.');

        return to_route('admin.maintenance-requests.index');
    }

    /**
     * Keep the request's room status in line with its open blocking requests.
     */
    private function syncRoom(MaintenanceRequest $maintenanceRequest): void
    {
        if ($maintenanceRequest->room !== null) {
            $this->roomStatus->sync($maintenanceRequest->room);
        }
    }

    /**
     * Render the shared create/edit form.
     */
    private function form(?MaintenanceRequest $maintenanceRequest, ?int $roomId): Response
    {
        return Inertia::render('admin/maintenance-requests/form', [
            'request' => $maintenanceRequest,
            'defaultRoomId' => $roomId,
            'rooms' => Room::query()->orderBy('number')->get(['id', 'number']),
            'employees' => Employee::query()
                ->where(fn (Builder $query) => $query->active()->when(
                    $maintenanceRequest?->assigned_to,
                    fn (Builder $query, int $assigneeId) => $query->orWhere('id', $assigneeId),
                ))
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'position']),
            'statuses' => MaintenanceStatus::options(),
            'priorities' => MaintenancePriority::options(),
        ]);
    }
}
