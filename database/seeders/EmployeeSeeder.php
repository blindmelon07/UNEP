<?php

namespace Database\Seeders;

use App\Enums\EmployeeStatus;
use App\Enums\Role;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Shift;
use App\Models\User;
use Database\Seeders\Support\DemoPeople;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    /**
     * Positions per department, with how many people hold each.
     *
     * @var array<string, array<string, int>>
     */
    private const array STAFFING = [
        'Front Office' => ['Front Desk Agent' => 3, 'Reservations Officer' => 1, 'Bellhop' => 2],
        'Housekeeping' => ['Room Attendant' => 5, 'Laundry Attendant' => 2],
        'Engineering' => ['Maintenance Technician' => 3, 'Electrician' => 1],
        'Food & Beverage' => ['Cook' => 2, 'Waiter' => 3],
        'Purchasing' => ['Purchasing Assistant' => 1],
        'Security' => ['Security Guard' => 2],
    ];

    /**
     * Shift patterns: morning, afternoon and night.
     *
     * @var list<array{0: string, 1: string}>
     */
    private const array SHIFTS = [['06:00', '14:00'], ['14:00', '22:00'], ['22:00', '06:00']];

    /**
     * Create departments, employees (linked to staff logins) and a two-week roster.
     */
    public function run(): void
    {
        $departments = collect(['Management', 'Front Office', 'Housekeeping', 'Engineering', 'Food & Beverage', 'Purchasing', 'Human Resources', 'Security'])
            ->mapWithKeys(fn (string $name): array => [$name => Department::create(['name' => $name])]);

        $number = 1;

        $linkedPositions = [
            Role::Admin->value => ['Management', 'General Manager'],
            Role::FrontDesk->value => ['Front Office', 'Front Office Supervisor'],
            Role::Maintenance->value => ['Engineering', 'Chief Engineer'],
            Role::Inventory->value => ['Purchasing', 'Storekeeper'],
            Role::HumanResources->value => ['Human Resources', 'HR Officer'],
        ];

        foreach (User::query()->orderBy('id')->get() as $user) {
            [$department, $position] = $linkedPositions[$user->role->value];

            if ($user->email === 'housekeeping@hotel.test') {
                [$department, $position] = ['Housekeeping', 'Executive Housekeeper'];
            } elseif ($user->email === 'trainee@hotel.test') {
                $position = 'HTM Student Trainee';
            } elseif ($user->email === 'nightaudit@hotel.test') {
                $position = 'Night Auditor';
            }

            [$firstName, $lastName] = str_contains($user->name, ' ') ? explode(' ', $user->name, 2) : [$user->name, 'Staff'];

            Employee::factory()->create([
                'user_id' => $user->id,
                'department_id' => $departments[$department]->id,
                'employee_number' => sprintf('EMP-%05d', $number++),
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $user->email,
                'position' => $position,
                'status' => $user->is_active ? EmployeeStatus::Active : EmployeeStatus::Terminated,
            ]);
        }

        foreach (self::STAFFING as $department => $positions) {
            foreach ($positions as $position => $headcount) {
                foreach (range(1, $headcount) as $ignored) {
                    [$firstName, $lastName] = DemoPeople::name();

                    Employee::factory()->create([
                        'department_id' => $departments[$department]->id,
                        'employee_number' => sprintf('EMP-%05d', $number++),
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'email' => DemoPeople::email($firstName, $lastName),
                        'phone' => DemoPeople::mobile(),
                        'position' => $position,
                        'monthly_salary' => fake()->randomElement([14500, 16000, 18000, 21000, 24000]),
                        'status' => fake()->randomElement([...array_fill(0, 12, EmployeeStatus::Active), EmployeeStatus::OnLeave]),
                    ]);
                }
            }
        }

        $this->seedRoster();
    }

    /**
     * Give every active employee five shifts in each of this week and next week.
     */
    private function seedRoster(): void
    {
        $weekStart = today()->startOfWeek();

        foreach (Employee::query()->active()->orderBy('id')->get() as $index => $employee) {
            $pattern = self::SHIFTS[$index % 3];

            foreach ([0, 7] as $weekOffset) {
                foreach (range(0, 4) as $day) {
                    Shift::create([
                        'employee_id' => $employee->id,
                        'date' => $weekStart->copy()->addDays($weekOffset + (($day + $index) % 7))->toDateString(),
                        'starts_at' => $pattern[0],
                        'ends_at' => $pattern[1],
                    ]);
                }
            }
        }
    }
}
