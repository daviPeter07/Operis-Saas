<?php

use Inertia\Testing\AssertableInertia as Assert;

test('landing page receives the three most recent updates, newest first', function () {
    config(['landing.updates' => [
        ['date' => '2026-01-10', 'type' => 'novidade', 'title' => 'Antiga', 'description' => 'Texto'],
        ['date' => '2026-03-01', 'type' => 'correcao', 'title' => 'Mais nova', 'description' => 'Texto'],
        ['date' => '2026-02-15', 'type' => 'melhoria', 'title' => 'Do meio', 'description' => 'Texto'],
        ['date' => '2026-02-01', 'type' => 'novidade', 'title' => 'Terceira', 'description' => 'Texto'],
    ]]);

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('home/index')
            ->has('updates', 3)
            ->where('updates.0.title', 'Mais nova')
            ->where('updates.1.title', 'Do meio')
            ->where('updates.2.title', 'Terceira'));
});

test('configured updates use a known type and a valid date', function () {
    foreach (config('landing.updates') as $update) {
        expect($update['type'])->toBeIn(['novidade', 'melhoria', 'correcao'])
            ->and(DateTime::createFromFormat('Y-m-d', $update['date']))->not->toBeFalse()
            ->and($update['title'])->not->toBeEmpty()
            ->and($update['description'])->not->toBeEmpty();
    }
});
