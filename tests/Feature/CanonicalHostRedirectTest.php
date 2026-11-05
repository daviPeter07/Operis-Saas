<?php

use App\Http\Middleware\RedirectToCanonicalHost;
use Illuminate\Http\Request;

beforeEach(function () {
    config(['app.url' => 'https://www.dgcomputer.com.br']);
});

test('bare domain is redirected to the www host keeping path and query', function () {
    $this->get('https://dgcomputer.com.br/login?redirect=dashboard')
        ->assertStatus(301)
        ->assertRedirect('https://www.dgcomputer.com.br/login?redirect=dashboard');
});

test('bare domain keeps the app subdirectory and trailing slash in the redirect', function () {
    // Built by hand: the HTTP test helpers trim the trailing slash that Apache keeps.
    $request = Request::create('https://dgcomputer.com.br/operis/', 'GET', server: [
        'SCRIPT_NAME' => '/operis/index.php',
    ]);

    $response = (new RedirectToCanonicalHost)->handle($request, fn () => response('next'));

    expect($response->getStatusCode())->toBe(301)
        ->and($response->headers->get('Location'))->toBe('https://www.dgcomputer.com.br/operis/');
});

test('form posts on the bare domain are redirected with 308 to keep the method', function () {
    $this->post('https://dgcomputer.com.br/login', ['email' => 'x@y.com'])
        ->assertStatus(308)
        ->assertRedirect('https://www.dgcomputer.com.br/login');
});

test('requests already on the www host are not redirected', function () {
    $this->get('https://www.dgcomputer.com.br/')->assertOk();
});

test('other hosts such as local development are not redirected', function () {
    config(['app.url' => 'http://localhost:8000']);

    $this->get('http://localhost:8000/')->assertOk();
    $this->get('http://127.0.0.1:8000/')->assertOk();
});
