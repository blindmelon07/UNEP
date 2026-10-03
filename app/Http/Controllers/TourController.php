<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TourController extends Controller
{
    /**
     * Show the virtual walkthrough of the hotel, optionally starting at a given stop.
     */
    public function __invoke(Request $request): Response
    {
        $validated = $request->validate([
            'start' => ['nullable', 'string', 'alpha_dash', 'max:50'],
        ]);

        return Inertia::render('public/tour', [
            'start' => $validated['start'] ?? null,
        ]);
    }
}
