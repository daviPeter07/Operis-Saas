<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))
        ->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page->component('dashboard/index'));
});

test('admin company can access settings', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard.settings'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page->component('dashboard/settings'));
});

test('authenticated users can visit the team page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard.team'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page->component('dashboard/team'));
});
