<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GuestRequest;
use App\Models\Guest;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuestController extends Controller
{
    /**
     * List guests, optionally searching by name, email or phone.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        return Inertia::render('admin/guests/index', [
            'guests' => Guest::query()
                ->withCount('reservations')
                ->when($search !== '', fn (Builder $query) => $query->where(fn (Builder $query) => $query
                    ->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")))
                ->latest()
                ->paginate(20)
                ->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Show the form for a new guest.
     */
    public function create(): Response
    {
        return Inertia::render('admin/guests/form', ['guest' => null]);
    }

    /**
     * Store a new guest.
     */
    public function store(GuestRequest $request): RedirectResponse
    {
        $guest = Guest::create($request->validated());

        Inertia::flash('success', 'Guest created.');

        return to_route('admin.guests.show', $guest);
    }

    /**
     * Show a guest's profile and stay history.
     */
    public function show(Guest $guest): Response
    {
        return Inertia::render('admin/guests/show', [
            'guest' => $guest,
            'reservations' => $guest->reservations()
                ->with(['roomType:id,name', 'room:id,number'])
                ->latest('check_in')
                ->get(),
        ]);
    }

    /**
     * Show the form for editing a guest.
     */
    public function edit(Guest $guest): Response
    {
        return Inertia::render('admin/guests/form', ['guest' => $guest]);
    }

    /**
     * Update a guest.
     */
    public function update(GuestRequest $request, Guest $guest): RedirectResponse
    {
        $guest->update($request->validated());

        Inertia::flash('success', 'Guest updated.');

        return to_route('admin.guests.show', $guest);
    }

    /**
     * Delete a guest without any reservations.
     */
    public function destroy(Guest $guest): RedirectResponse
    {
        if ($guest->reservations()->exists()) {
            Inertia::flash('error', 'Guests with reservations cannot be deleted.');

            return back();
        }

        $guest->delete();

        Inertia::flash('success', 'Guest deleted.');

        return to_route('admin.guests.index');
    }
}
