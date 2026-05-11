<?php

use Tests\TestCase;

uses(TestCase::class);

test('that true is true', function () {
    expect(true)->toBeTrue();
});

test('database configuration defaults to mysql', function () {
    expect(config('database.connections.mysql.driver'))->toBe('mysql');
});
