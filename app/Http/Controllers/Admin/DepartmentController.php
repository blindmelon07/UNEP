<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    /**
     * List departments with headcounts.
     */
    public function index(): Response
    {
        return Inertia::render('admin/departments/index', [
            'departments' => Department::query()->withCount('employees')->orderBy('name')->get(),
        ]);
    }

    /**
     * Store a new department.
     */
    public function store(Request $request): RedirectResponse
    {
        Department::create($request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:departments'],
        ]));

        Inertia::flash('success', 'Department created.');

        return back();
    }

    /**
     * Rename a department.
     */
    public function update(Request $request, Department $department): RedirectResponse
    {
        $department->update($request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('departments')->ignore($department)],
        ]));

        Inertia::flash('success', 'Department renamed.');

        return back();
    }

    /**
     * Delete a department with no employees.
     */
    public function destroy(Department $department): RedirectResponse
    {
        if ($department->employees()->exists()) {
            Inertia::flash('error', 'Reassign this department\'s employees first.');

            return back();
        }

        $department->delete();

        Inertia::flash('success', 'Department deleted.');

        return back();
    }
}
