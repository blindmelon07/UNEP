<?php

namespace App\Http\Controllers;

use App\Models\RoomType;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Show the public hotel landing page.
     */
    public function __invoke(): Response
    {
        return Inertia::render('public/home', [
            'roomTypes' => RoomType::query()
                ->orderBy('base_rate')
                ->get(['id', 'name', 'slug', 'description', 'base_rate', 'capacity', 'amenities', 'image_url']),
        ]);
    }
}
