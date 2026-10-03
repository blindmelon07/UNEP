<?php

use App\Models\RoomType;
use App\Models\User;

/**
 * @return array<string, mixed>
 */
function roomTypePayload(array $overrides = []): array
{
    return [
        'name' => 'Deluxe Room',
        'base_rate' => 2800,
        'capacity' => 3,
        'amenities' => 'Wi-Fi, Smart TV, Sofa lounge',
        ...$overrides,
    ];
}

it('accepts a photo stored in the public folder or hosted elsewhere', function (string $imageUrl) {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.room-types.store'), roomTypePayload(['image_url' => $imageUrl]))
        ->assertRedirect(route('admin.room-types.index'));

    expect(RoomType::sole())
        ->image_url->toBe($imageUrl)
        ->slug->toBe('deluxe-room')
        ->amenities->toBe(['Wi-Fi', 'Smart TV', 'Sofa lounge']);
})->with([
    'public path' => '/images/facility/deluxe-room.jpg',
    'external link' => 'https://example.com/deluxe.jpg',
]);

it('rejects a photo that is neither a link nor a public path', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('admin.room-types.store'), roomTypePayload(['image_url' => 'deluxe room photo']));

    $response->assertSessionHasErrors('image_url');
    expect(RoomType::count())->toBe(0);
});
