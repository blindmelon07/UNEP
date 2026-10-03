<?php

namespace Database\Seeders;

use App\Enums\MaintenancePriority;
use App\Enums\MaintenanceStatus;
use App\Enums\RoomStatus;
use App\Enums\StockMovementType;
use App\Models\Department;
use App\Models\Employee;
use App\Models\InventoryItem;
use App\Models\MaintenanceRequest;
use App\Models\Room;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class MaintenanceSeeder extends Seeder
{
    /**
     * Resolved jobs: title, priority, days ago, resolution, part used (name, quantity), and a non-room location (null picks a guest room).
     *
     * @return list<array{0: string, 1: MaintenancePriority, 2: int, 3: string, 4: array{0: string, 1: int}|null, 5: string|null}>
     */
    private function resolvedJobs(): array
    {
        return [
            ['Clogged shower drain', MaintenancePriority::Medium, 40, 'Cleared hair build-up and flushed the drain line.', null, null],
            ['Aircon not cooling', MaintenancePriority::High, 33, 'Cleaned coils and replaced the dirty filter.', ['Aircon filter', 1], null],
            ['Bathroom light busted', MaintenancePriority::Low, 27, 'Replaced bulb.', ['LED bulb 9W', 1], null],
            ['Leaking faucet', MaintenancePriority::Medium, 21, 'Replaced worn faucet cartridge.', ['Faucet cartridge', 1], null],
            ['Door lock not reading key cards', MaintenancePriority::High, 15, 'Replaced lock batteries and re-encoded cards.', ['Door lock battery (AA)', 4], null],
            ['TV has no signal', MaintenancePriority::Low, 9, 'Re-seated the coaxial connector.', null, null],
            ['Hallway lights flickering', MaintenancePriority::Medium, 5, 'Replaced two LED bulbs on the 2nd floor corridor.', ['LED bulb 9W', 2], '2nd floor corridor'],
        ];
    }

    /**
     * Create a history of resolved jobs plus a realistic open work-order queue.
     */
    public function run(): void
    {
        $reporters = User::query()->whereIn('email', ['maintenance@hotel.test', 'housekeeping@hotel.test', 'frontdesk@hotel.test'])->get();
        $technicians = Employee::query()->active()
            ->whereBelongsTo(Department::query()->where('name', 'Engineering')->firstOrFail())
            ->get();
        $rooms = Room::query()->where('status', '!=', RoomStatus::OutOfService)->get();

        foreach ($this->resolvedJobs() as [$title, $priority, $daysAgo, $resolution, $part, $location]) {
            $reportedAt = CarbonImmutable::now()->subDays($daysAgo)->setTime(fake()->numberBetween(7, 18), 15);
            $request = MaintenanceRequest::query()->forceCreate([
                'room_id' => $location === null ? $rooms->random()->id : null,
                'location' => $location,
                'title' => $title,
                'priority' => $priority,
                'status' => MaintenanceStatus::Resolved,
                'reported_by' => $reporters->random()->id,
                'assigned_to' => $technicians->random()->id,
                'resolution_notes' => $resolution,
                'resolved_at' => $reportedAt->addHours(fake()->numberBetween(2, 30)),
                'created_at' => $reportedAt,
                'updated_at' => $reportedAt,
            ]);

            if ($part !== null) {
                $this->issuePart($request, $part[0], $part[1], $reportedAt->addHours(2));
            }
        }

        $blockedRoom = $rooms->firstWhere('status', RoomStatus::Available);

        $this->open([
            'room_id' => $blockedRoom?->id,
            'title' => 'Ceiling leak above the bed',
            'description' => 'Water stain spreading after last night\'s rain. Bed moved away; room cannot be sold.',
            'priority' => MaintenancePriority::Urgent,
            'status' => MaintenanceStatus::InProgress,
            'blocks_room' => true,
            'assigned_to' => $technicians->first()?->id,
        ], 0, $reporters);

        $blockedRoom?->update(['status' => RoomStatus::Maintenance]);

        $this->open(['location' => 'Lobby', 'title' => 'Automatic door sensor intermittent', 'priority' => MaintenancePriority::Medium, 'assigned_to' => $technicians->last()?->id], 2, $reporters);
        $this->open(['location' => 'Bar & F&B laboratory', 'title' => 'Commercial blender motor overheating', 'priority' => MaintenancePriority::High, 'status' => MaintenanceStatus::OnHold, 'description' => 'Waiting for a replacement motor from the supplier in Naga.'], 4, $reporters);
        $this->open(['room_id' => $rooms->random()->id, 'title' => 'Squeaky closet door', 'priority' => MaintenancePriority::Low], 1, $reporters);
        $this->open(['room_id' => $rooms->random()->id, 'title' => 'Weak water pressure in shower', 'priority' => MaintenancePriority::Medium, 'assigned_to' => $technicians->random()->id], 1, $reporters);
        $this->open(['location' => 'Kitchen', 'title' => 'Exhaust hood fan rattling', 'priority' => MaintenancePriority::Medium], 3, $reporters);
        $this->open(['location' => 'Parking area', 'title' => 'Two lamp posts not lighting up', 'priority' => MaintenancePriority::Low], 6, $reporters);
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @param  Collection<int, User>  $reporters
     */
    private function open(array $attributes, int $daysAgo, $reporters): void
    {
        $reportedAt = CarbonImmutable::now()->subDays($daysAgo)->subHours(fake()->numberBetween(1, 6));

        MaintenanceRequest::query()->forceCreate([
            'status' => MaintenanceStatus::Open,
            'blocks_room' => false,
            'reported_by' => $reporters->random()->id,
            ...$attributes,
            'created_at' => $reportedAt,
            'updated_at' => $reportedAt,
        ]);
    }

    /**
     * Issue a spare part against a request, keeping the item balance in step.
     */
    private function issuePart(MaintenanceRequest $request, string $itemName, int $quantity, CarbonImmutable $at): void
    {
        $item = InventoryItem::query()->where('name', $itemName)->first();

        if ($item === null || $item->quantity < $quantity) {
            return;
        }

        $item->forceFill(['quantity' => $item->quantity - $quantity])->save();

        $item->movements()->forceCreate([
            'type' => StockMovementType::Out,
            'quantity' => -$quantity,
            'balance_after' => $item->quantity,
            'notes' => "Used on maintenance #{$request->id}: {$request->title}",
            'user_id' => User::query()->where('email', 'maintenance@hotel.test')->value('id'),
            'maintenance_request_id' => $request->id,
            'created_at' => $at,
            'updated_at' => $at,
        ]);
    }
}
