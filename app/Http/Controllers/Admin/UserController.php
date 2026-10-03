<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * List staff login accounts.
     */
    public function index(): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => User::query()->orderBy('name')->get(['id', 'name', 'email', 'role', 'is_active', 'created_at']),
            'roles' => Role::options(),
        ]);
    }

    /**
     * Show the form for a new staff account.
     */
    public function create(): Response
    {
        return Inertia::render('admin/users/form', ['user' => null, 'roles' => Role::options()]);
    }

    /**
     * Create a staff account.
     */
    public function store(UserRequest $request): RedirectResponse
    {
        User::create($request->validated());

        Inertia::flash('success', 'Staff account created.');

        return to_route('admin.users.index');
    }

    /**
     * Show the form for editing a staff account.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/form', [
            'user' => $user->only(['id', 'name', 'email', 'role', 'is_active']),
            'roles' => Role::options(),
        ]);
    }

    /**
     * Update a staff account, keeping the current password when none is given.
     */
    public function update(UserRequest $request, User $user): RedirectResponse
    {
        $data = $request->safe()->except('password');

        if ($request->user()->is($user) && ($data['role'] !== Role::Admin->value || ! ($data['is_active'] ?? true))) {
            return back()->withErrors(['role' => 'You cannot remove your own administrator access.']);
        }

        if ($request->filled('password')) {
            $data['password'] = $request->validated('password');
        }

        $user->update($data);

        Inertia::flash('success', 'Staff account updated.');

        return to_route('admin.users.index');
    }

    /**
     * Delete a staff account other than your own.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->is($user)) {
            Inertia::flash('error', 'You cannot delete your own account.');

            return back();
        }

        $user->delete();

        Inertia::flash('success', 'Staff account deleted.');

        return to_route('admin.users.index');
    }
}
