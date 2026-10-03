<?php

namespace Database\Seeders;

use App\Enums\RoomStatus;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RoomSeeder extends Seeder
{
    /**
     * The training hotel's room categories, matching the signage on site.
     *
     * Each entry: name, nightly rate, capacity, description, amenities, photo, and room numbers keyed by floor.
     *
     * @var list<array{0: string, 1: int, 2: int, 3: string, 4: list<string>, 5: string, 6: array<int, list<string>>}>
     */
    private const array ROOM_TYPES = [
        [
            'Deluxe Room', 2800, 3,
            'Our most spacious room: a queen bed under a warm wood-panelled ceiling, a separate sofa lounge, dining table, smart TV and en-suite shower.',
            ['Air conditioning', 'Wi-Fi', 'Smart TV', 'Sofa lounge', 'Dining table', 'En-suite shower', 'Vanity'],
            '/images/facility/deluxe-room.jpg',
            [1 => ['101', '102']],
        ],
        [
            'Standard Room', 1800, 2,
            'A neat, quiet room with a double bed, blackout curtains and a dresser — ideal for solo travellers and couples.',
            ['Air conditioning', 'Wi-Fi', 'Blackout curtains', 'Dresser'],
            '/images/facility/standard-room.jpg',
            [1 => ['103', '104', '105']],
        ],
        [
            'Economy Room', 1500, 3,
            'A double bed plus a single bed, so friends or a small family can share one comfortable, budget-friendly room.',
            ['Air conditioning', 'Wi-Fi', 'TV', 'Wardrobe'],
            '/images/facility/economy-room.jpg',
            [1 => ['106', '107', '108']],
        ],
        [
            'Hostel Room', 800, 4,
            'Simple, dormitory-style rooms along the hostel wing — great value for student groups, teams and seminar participants.',
            ['Electric fan', 'Shared bathroom', 'Lockers'],
            '/images/facility/hostel.jpg',
            [2 => ['201', '202', '203', '204', '205', '206']],
        ],
    ];

    /**
     * Create the room types and their rooms.
     */
    public function run(): void
    {
        foreach (self::ROOM_TYPES as [$name, $rate, $capacity, $description, $amenities, $photo, $roomsByFloor]) {
            $roomType = RoomType::create([
                'name' => $name,
                'slug' => Str::slug($name),
                'base_rate' => $rate,
                'capacity' => $capacity,
                'description' => $description,
                'amenities' => $amenities,
                'image_url' => $photo,
            ]);

            foreach ($roomsByFloor as $floor => $numbers) {
                foreach ($numbers as $number) {
                    Room::create([
                        'room_type_id' => $roomType->id,
                        'number' => $number,
                        'floor' => $floor,
                        'status' => RoomStatus::Available,
                    ]);
                }
            }
        }

        Room::query()->where('number', '206')->update([
            'status' => RoomStatus::OutOfService,
            'notes' => 'Reserved as a storage room for the hostel wing.',
        ]);
    }
}
