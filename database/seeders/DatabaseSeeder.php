<?php

namespace Database\Seeders;

use App\Enums\MaintenancePriority;
use App\Enums\MaintenanceStatus;
use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use App\Enums\Role;
use App\Enums\RoomStatus;
use App\Enums\StockMovementType;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Guest;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\MaintenanceRequest;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database with a demo hotel.
     */
    public function run(): void
    {
        $users = $this->seedStaffAccounts();
        $rooms = $this->seedRooms();
        $this->seedReservations($rooms, $users[Role::FrontDesk->value]);
        $employees = $this->seedEmployees($users);
        $this->seedInventory($users[Role::Inventory->value]);
        $this->seedMaintenance($rooms, $employees, $users[Role::Maintenance->value]);
    }

    /**
     * Create one login per role. Every demo account uses the password "password".
     *
     * @return array<string, User>
     */
    private function seedStaffAccounts(): array
    {
        $accounts = [
            Role::Admin->value => ['Hotel Administrator', 'admin@hotel.test'],
            Role::FrontDesk->value => ['Front Desk Agent', 'frontdesk@hotel.test'],
            Role::Maintenance->value => ['Maintenance Lead', 'maintenance@hotel.test'],
            Role::Inventory->value => ['Storekeeper', 'inventory@hotel.test'],
            Role::HumanResources->value => ['HR Officer', 'hr@hotel.test'],
        ];

        return collect($accounts)->map(fn (array $account, string $role): User => User::factory()->create([
            'name' => $account[0],
            'email' => $account[1],
            'role' => Role::from($role),
        ]))->all();
    }

    /**
     * Create room types and three floors of rooms.
     *
     * @return list<Room>
     */
    private function seedRooms(): array
    {
        $types = collect([
            ['Standard Room', 2500, 2, 'A cozy room with a queen bed, ideal for solo travellers and couples.', ['Air conditioning', 'Wi-Fi', 'Smart TV', 'Hot shower']],
            ['Deluxe Room', 3800, 2, 'A spacious room with a king bed, work desk and city view.', ['Air conditioning', 'Wi-Fi', 'Smart TV', 'Minibar', 'City view']],
            ['Family Room', 5200, 4, 'Two queen beds and a sitting area for the whole family.', ['Air conditioning', 'Wi-Fi', 'Smart TV', 'Sofa bed', 'Bathtub']],
            ['Executive Suite', 8500, 3, 'A separate living room, king bed, and lounge access.', ['Air conditioning', 'Wi-Fi', 'Smart TV', 'Minibar', 'Lounge access', 'Bathtub']],
        ])->map(fn (array $type): RoomType => RoomType::create([
            'name' => $type[0],
            'slug' => Str::slug($type[0]),
            'base_rate' => $type[1],
            'capacity' => $type[2],
            'description' => $type[3],
            'amenities' => $type[4],
        ]));

        $rooms = [];

        foreach ([1, 2, 3] as $floor) {
            foreach (range(1, 6) as $position) {
                $type = $types[match (true) {
                    $position <= 2 => 0,
                    $position <= 4 => 1,
                    $position === 5 => 2,
                    default => 3,
                }];

                $rooms[] = Room::create([
                    'room_type_id' => $type->id,
                    'number' => sprintf('%d%02d', $floor, $position),
                    'floor' => $floor,
                    'status' => RoomStatus::Available,
                ]);
            }
        }

        return $rooms;
    }

    /**
     * Create guests with in-house, arriving, upcoming and pending online bookings.
     *
     * @param  list<Room>  $rooms
     */
    private function seedReservations(array $rooms, User $frontDesk): void
    {
        $guests = Guest::factory()->count(15)->create();

        foreach (array_slice($rooms, 0, 4) as $index => $room) {
            $reservation = $this->book($guests[$index], $room, now()->subDays(1), now()->addDays(2), ReservationStatus::CheckedIn, ReservationSource::WalkIn);
            $reservation->update(['checked_in_at' => now()->subDay()->setTime(14, 0)]);
            $room->update(['status' => RoomStatus::Occupied]);

            Payment::factory()->create([
                'reservation_id' => $reservation->id,
                'amount' => (float) $reservation->room_total / 2,
                'received_by' => $frontDesk->id,
            ]);
        }

        foreach (array_slice($rooms, 6, 3) as $index => $room) {
            $this->book($guests[4 + $index], $room, now(), now()->addDays(3), ReservationStatus::Confirmed, ReservationSource::Phone);
        }

        foreach (array_slice($rooms, 12, 3) as $index => $room) {
            $this->book($guests[7 + $index], $room, now()->addDays(5 + $index), now()->addDays(8 + $index), ReservationStatus::Confirmed, ReservationSource::Phone);
        }

        foreach (array_slice($rooms, 9, 2) as $index => $room) {
            $this->book($guests[10 + $index], $room, now()->addDays(10), now()->addDays(12), ReservationStatus::Pending, ReservationSource::Online, assignRoom: false);
        }

        $this->book($guests[12], $rooms[5], now()->subDays(6), now()->subDays(3), ReservationStatus::CheckedOut, ReservationSource::WalkIn);
    }

    /**
     * Create a single reservation for a room's type.
     */
    private function book(Guest $guest, Room $room, mixed $checkIn, mixed $checkOut, ReservationStatus $status, ReservationSource $source, bool $assignRoom = true): Reservation
    {
        $checkIn = $checkIn->copy()->startOfDay();
        $checkOut = $checkOut->copy()->startOfDay();
        $rate = (float) $room->roomType->base_rate;

        return Reservation::create([
            'code' => Reservation::generateCode(),
            'guest_id' => $guest->id,
            'room_type_id' => $room->room_type_id,
            'room_id' => $assignRoom ? $room->id : null,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'adults' => 2,
            'children' => 0,
            'status' => $status,
            'source' => $source,
            'nightly_rate' => $rate,
            'room_total' => $rate * Reservation::nightsBetween($checkIn, $checkOut),
            'checked_out_at' => $status === ReservationStatus::CheckedOut ? $checkOut->copy()->setTime(11, 0) : null,
        ]);
    }

    /**
     * Create departments, employees (linked to the staff logins) and this week's roster.
     *
     * @param  array<string, User>  $users
     * @return list<Employee>
     */
    private function seedEmployees(array $users): array
    {
        $departments = collect(['Front Office', 'Housekeeping', 'Engineering', 'Purchasing', 'Human Resources', 'Management'])
            ->mapWithKeys(fn (string $name): array => [$name => Department::create(['name' => $name])]);

        $linked = [
            [Role::Admin, 'Management', 'General Manager'],
            [Role::FrontDesk, 'Front Office', 'Front Desk Agent'],
            [Role::Maintenance, 'Engineering', 'Chief Engineer'],
            [Role::Inventory, 'Purchasing', 'Storekeeper'],
            [Role::HumanResources, 'Human Resources', 'HR Officer'],
        ];

        $employees = [];

        foreach ($linked as [$role, $department, $position]) {
            [$firstName, $lastName] = explode(' ', $users[$role->value]->name, 2) + [1 => 'Staff'];

            $employees[] = Employee::factory()->create([
                'user_id' => $users[$role->value]->id,
                'department_id' => $departments[$department]->id,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $users[$role->value]->email,
                'position' => $position,
            ]);
        }

        foreach (['Housekeeping' => 'Room Attendant', 'Engineering' => 'Maintenance Technician', 'Front Office' => 'Receptionist'] as $department => $position) {
            foreach (range(1, 3) as $ignored) {
                $employees[] = Employee::factory()->create([
                    'department_id' => $departments[$department]->id,
                    'position' => $position,
                ]);
            }
        }

        $weekStart = now()->startOfWeek();

        foreach ($employees as $index => $employee) {
            foreach (range(0, 4) as $day) {
                Shift::create([
                    'employee_id' => $employee->id,
                    'date' => $weekStart->copy()->addDays(($day + $index) % 7)->toDateString(),
                    'starts_at' => $index % 2 === 0 ? '06:00' : '14:00',
                    'ends_at' => $index % 2 === 0 ? '14:00' : '22:00',
                ]);
            }
        }

        return $employees;
    }

    /**
     * Create stock items with an opening-balance movement each.
     */
    private function seedInventory(User $storekeeper): void
    {
        $catalog = [
            'Guest Amenities' => [['Shampoo 30ml', 'bottle', 240, 100, 12], ['Bath soap', 'pcs', 60, 100, 9], ['Dental kit', 'pcs', 180, 80, 15]],
            'Linen' => [['Bath towel', 'pcs', 120, 40, 350], ['Bed sheet (queen)', 'pcs', 35, 40, 650], ['Pillow case', 'pcs', 90, 40, 120]],
            'Cleaning Supplies' => [['All-purpose cleaner 1L', 'bottle', 24, 10, 180], ['Garbage bags', 'roll', 6, 15, 95]],
            'Engineering Spares' => [['LED bulb 9W', 'pcs', 40, 20, 85], ['Aircon filter', 'pcs', 4, 6, 450], ['Faucet cartridge', 'pcs', 8, 5, 520]],
            'Minibar' => [['Bottled water 500ml', 'bottle', 300, 120, 15], ['Potato chips', 'pack', 45, 50, 40]],
        ];

        $sku = 1000;

        foreach ($catalog as $categoryName => $items) {
            $category = InventoryCategory::create(['name' => $categoryName]);

            foreach ($items as [$name, $unit, $quantity, $reorderLevel, $unitCost]) {
                $item = InventoryItem::factory()->create([
                    'inventory_category_id' => $category->id,
                    'sku' => 'SKU-'.$sku++,
                    'name' => $name,
                    'unit' => $unit,
                    'quantity' => $quantity,
                    'reorder_level' => $reorderLevel,
                    'unit_cost' => $unitCost,
                ]);

                $item->movements()->create([
                    'type' => StockMovementType::In,
                    'quantity' => $quantity,
                    'balance_after' => $quantity,
                    'notes' => 'Opening stock',
                    'user_id' => $storekeeper->id,
                ]);
            }
        }
    }

    /**
     * Create open and resolved maintenance requests, one of which takes a room out of service.
     *
     * @param  list<Room>  $rooms
     * @param  list<Employee>  $employees
     */
    private function seedMaintenance(array $rooms, array $employees, User $reporter): void
    {
        $technician = $employees[2];

        MaintenanceRequest::create([
            'room_id' => $rooms[17]->id,
            'title' => 'Aircon leaking water',
            'description' => 'Water dripping from the indoor unit onto the carpet.',
            'priority' => MaintenancePriority::High,
            'status' => MaintenanceStatus::InProgress,
            'blocks_room' => true,
            'reported_by' => $reporter->id,
            'assigned_to' => $technician->id,
        ]);
        $rooms[17]->update(['status' => RoomStatus::Maintenance]);

        MaintenanceRequest::create([
            'room_id' => $rooms[1]->id,
            'title' => 'Bathroom light flickering',
            'priority' => MaintenancePriority::Low,
            'status' => MaintenanceStatus::Open,
            'reported_by' => $reporter->id,
        ]);

        MaintenanceRequest::create([
            'location' => 'Lobby',
            'title' => 'Automatic door sensor intermittent',
            'priority' => MaintenancePriority::Medium,
            'status' => MaintenanceStatus::Open,
            'reported_by' => $reporter->id,
            'assigned_to' => $technician->id,
        ]);

        MaintenanceRequest::create([
            'room_id' => $rooms[8]->id,
            'title' => 'Clogged shower drain',
            'priority' => MaintenancePriority::Medium,
            'status' => MaintenanceStatus::Resolved,
            'reported_by' => $reporter->id,
            'assigned_to' => $technician->id,
            'resolution_notes' => 'Cleared hair build-up and flushed the drain.',
            'resolved_at' => now()->subDays(2),
        ]);
    }
}
