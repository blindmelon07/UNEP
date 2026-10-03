<?php

use App\Enums\Role;
use App\Models\Employee;
use App\Models\Shift;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->hr = User::factory()->role(Role::HumanResources)->create();
});

it('schedules a shift', function () {
    $employee = Employee::factory()->create();

    $this->actingAs($this->hr)->post(route('admin.shifts.store'), [
        'employee_id' => $employee->id,
        'date' => '2026-10-05',
        'starts_at' => '06:00',
        'ends_at' => '14:00',
    ])->assertSessionHasNoErrors();

    expect(Shift::sole())
        ->employee_id->toBe($employee->id)
        ->date->toDateString()->toBe('2026-10-05');
});

it('refuses a second shift for the same employee on the same day', function () {
    $shift = Shift::factory()->create(['date' => '2026-10-05']);

    $response = $this->actingAs($this->hr)->post(route('admin.shifts.store'), [
        'employee_id' => $shift->employee_id,
        'date' => '2026-10-05',
        'starts_at' => '14:00',
        'ends_at' => '22:00',
    ]);

    $response->assertSessionHasErrors(['employee_id' => 'This employee already has a shift on that day.']);
    expect(Shift::count())->toBe(1);
});

it('shows only the requested week on the roster', function () {
    Shift::factory()->create(['date' => '2026-10-07']);
    Shift::factory()->create(['date' => '2026-10-14']);

    $response = $this->actingAs($this->hr)->get(route('admin.shifts.index', ['week' => '2026-10-07']));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('weekStart', '2026-10-05')
        ->has('days', 7)
        ->has('shifts', 1)
        ->where('shifts.0.date', '2026-10-07'));
});
