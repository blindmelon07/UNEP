<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EmployeeStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\EmployeeRequest;
use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    /**
     * List employees with department, status and keyword filters.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'department' => ['nullable', 'integer'],
            'status' => ['nullable', Rule::enum(EmployeeStatus::class)],
        ]);

        return Inertia::render('admin/employees/index', [
            'employees' => Employee::query()
                ->with('department:id,name')
                ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(fn (Builder $query) => $query
                    ->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('employee_number', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%")))
                ->when($filters['department'] ?? null, fn (Builder $query, int|string $department) => $query->where('department_id', $department))
                ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
                ->orderBy('last_name')
                ->paginate(25)
                ->withQueryString(),
            'filters' => $filters,
            'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
            'statuses' => EmployeeStatus::options(),
        ]);
    }

    /**
     * Show the form for a new employee.
     */
    public function create(): Response
    {
        return $this->form(null);
    }

    /**
     * Store a new employee.
     */
    public function store(EmployeeRequest $request): RedirectResponse
    {
        $employee = Employee::create($request->validated());

        Inertia::flash('success', 'Employee added.');

        return to_route('admin.employees.show', $employee);
    }

    /**
     * Show an employee profile with upcoming shifts and assigned work.
     */
    public function show(Employee $employee): Response
    {
        return Inertia::render('admin/employees/show', [
            'employee' => $employee->load(['department:id,name', 'user:id,name,email,role']),
            'upcomingShifts' => $employee->shifts()->whereDate('date', '>=', today())->orderBy('date')->orderBy('starts_at')->limit(14)->get(),
            'openAssignments' => $employee->assignedMaintenanceRequests()
                ->with('room:id,number')
                ->whereIn('status', ['open', 'in_progress', 'on_hold'])
                ->latest()
                ->get(['id', 'room_id', 'location', 'title', 'priority', 'status']),
        ]);
    }

    /**
     * Show the form for editing an employee.
     */
    public function edit(Employee $employee): Response
    {
        return $this->form($employee);
    }

    /**
     * Update an employee.
     */
    public function update(EmployeeRequest $request, Employee $employee): RedirectResponse
    {
        $employee->update($request->validated());

        Inertia::flash('success', 'Employee updated.');

        return to_route('admin.employees.show', $employee);
    }

    /**
     * Delete an employee record.
     */
    public function destroy(Employee $employee): RedirectResponse
    {
        $employee->delete();

        Inertia::flash('success', 'Employee deleted.');

        return to_route('admin.employees.index');
    }

    /**
     * Render the shared create/edit form.
     */
    private function form(?Employee $employee): Response
    {
        return Inertia::render('admin/employees/form', [
            'employee' => $employee,
            'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
            'statuses' => EmployeeStatus::options(),
            'users' => User::query()
                ->whereDoesntHave('employee', fn (Builder $query) => $query->when($employee, fn (Builder $query) => $query->whereKeyNot($employee->id)))
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
        ]);
    }
}
