<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Shift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ShiftController extends Controller
{
    /**
     * Show the weekly shift roster.
     */
    public function index(Request $request): Response
    {
        $validated = $request->validate(['week' => ['nullable', 'date']]);
        $weekStart = Carbon::parse($validated['week'] ?? today())->startOfWeek();
        $weekEnd = $weekStart->copy()->endOfWeek();

        return Inertia::render('admin/shifts/index', [
            'weekStart' => $weekStart->toDateString(),
            'days' => collect(range(0, 6))->map(fn (int $offset): string => $weekStart->copy()->addDays($offset)->toDateString()),
            'shifts' => Shift::query()
                ->with('employee:id,first_name,last_name,position')
                ->whereBetween('date', [$weekStart->toDateString(), $weekEnd->toDateString()])
                ->orderBy('starts_at')
                ->get(),
            'employees' => Employee::query()->active()->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'position']),
        ]);
    }

    /**
     * Schedule a shift, preventing double-booking an employee on the same day.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'date' => ['required', 'date'],
            'starts_at' => ['required', 'date_format:H:i'],
            'ends_at' => ['required', 'date_format:H:i', 'different:starts_at'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $alreadyScheduled = Shift::query()
            ->where('employee_id', $validated['employee_id'])
            ->whereDate('date', $validated['date'])
            ->exists();

        if ($alreadyScheduled) {
            return back()->withErrors(['employee_id' => 'This employee already has a shift on that day.']);
        }

        Shift::create($validated);

        Inertia::flash('success', 'Shift scheduled.');

        return back();
    }

    /**
     * Remove a shift from the roster.
     */
    public function destroy(Shift $shift): RedirectResponse
    {
        $shift->delete();

        Inertia::flash('success', 'Shift removed.');

        return back();
    }
}
