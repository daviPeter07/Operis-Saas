<?php

use App\Models\User;

test('guest cannot access auth me endpoint', function () {
    $response = $this->getJson('/api/auth/me');

    $response->assertUnauthorized();
});

test('api routes are registered under api prefix', function () {
    $routes = collect(app('router')->getRoutes())->filter(
        fn ($route) => str_starts_with($route->uri(), 'api/')
    );

    expect($routes)->not->toBeEmpty();
});

test('authenticated user can access auth me endpoint', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->getJson('/api/auth/me');

    $response->assertOk()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.email', $user->email);
});
