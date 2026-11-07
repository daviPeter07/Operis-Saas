<?php

use Inertia\Testing\AssertableInertia as Assert;

test('the terms of use and the privacy policy are public pages', function (string $path, string $component) {
    $this->get($path)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    'termos de uso' => ['/termos-de-uso', 'home/terms'],
    'política de privacidade' => ['/politica-de-privacidade', 'home/privacy'],
]);
