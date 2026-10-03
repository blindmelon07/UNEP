<?php

use Inertia\Testing\AssertableInertia as Assert;

it('renders the virtual tour from the default stop', function () {
    $response = $this->get(route('tour'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/tour')
        ->where('start', null));
});

it('starts the tour at the requested room', function () {
    $response = $this->get(route('tour', ['start' => 'deluxe-entrance']));

    $response->assertInertia(fn (Assert $page) => $page->where('start', 'deluxe-entrance'));
});

it('rejects a malformed start stop', function () {
    $response = $this->get(route('tour', ['start' => '<script>']));

    $response->assertSessionHasErrors('start');
});
