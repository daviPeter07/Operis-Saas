<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('home shows the landing page to guests', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('home'));
});

test('home keeps the landing page light even when the user prefers dark', function () {
    $this->withUnencryptedCookie('appearance', 'dark')
        ->get(route('home'))
        ->assertOk()
        ->assertSee('data-theme-lock="light"', false)
        ->assertDontSee('class="dark"', false);
});

test('home redirects authenticated users to dashboard', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('home'))
        ->assertRedirect(route('dashboard'));
});
