<?php

/**
 * Operis deploy receiver.
 *
 * Uploaded by the "Deploy Production" workflow to the public web directory
 * (e.g. ~/public_html/dg/operis/_deploy.php) together with a release zip in
 * <app>/storage/app/deploy/release.zip. When called via POST with the deploy
 * token it:
 *   1. extracts the release zip;
 *   2. swaps the application directories (app, vendor, config, ...) in place,
 *      keeping .env, storage/ and .git untouched;
 *   3. replaces the public assets in the web directory, preserving the
 *      server-specific index.php and .htaccess;
 *   4. boots the new Laravel app and runs migrations and cache commands.
 *
 * Placeholders are filled in by the workflow at upload time. Only a SHA-256
 * hash of the token is stored on the server.
 */
const DEPLOY_TOKEN_SHA256 = '__DEPLOY_TOKEN_SHA256__';
const DEPLOY_APP_PATH = '__DEPLOY_APP_PATH__';

/** Entries at the root of the release that replace their server counterparts. */
const SWAPPED_APP_ENTRIES = [
    'app', 'bootstrap', 'config', 'database', 'lang', 'public', 'resources', 'routes', 'vendor',
    'artisan', 'composer.json', 'composer.lock',
];

/** Files in the web directory that are server-specific and must never be overwritten. */
const PRESERVED_WEB_FILES = ['index.php', '.htaccess', '_deploy.php'];

header('Content-Type: application/json');

$log = [];

function logStep(string $message): void
{
    global $log;
    $log[] = '['.date('H:i:s').'] '.$message;
}

function respond(int $status, bool $ok, ?string $error = null): never
{
    global $log;
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'error' => $error, 'log' => $log], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function deleteRecursively(string $path): void
{
    if (is_link($path) || is_file($path)) {
        unlink($path);

        return;
    }

    if (! is_dir($path)) {
        return;
    }

    foreach (new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    ) as $item) {
        $item->isDir() && ! $item->isLink() ? rmdir($item->getPathname()) : unlink($item->getPathname());
    }

    rmdir($path);
}

function copyRecursively(string $source, string $target): void
{
    if (is_file($source)) {
        if (! copy($source, $target)) {
            throw new RuntimeException("Falha ao copiar {$source} para {$target}");
        }

        return;
    }

    if (! is_dir($target) && ! mkdir($target, 0755, true)) {
        throw new RuntimeException("Falha ao criar {$target}");
    }

    foreach (new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($source, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    ) as $item) {
        $destination = $target.DIRECTORY_SEPARATOR.substr($item->getPathname(), strlen($source) + 1);

        if ($item->isDir()) {
            if (! is_dir($destination) && ! mkdir($destination, 0755, true)) {
                throw new RuntimeException("Falha ao criar {$destination}");
            }
        } elseif (! copy($item->getPathname(), $destination)) {
            throw new RuntimeException("Falha ao copiar {$item->getPathname()}");
        }
    }
}

/** Moves a file or directory, falling back to copy + delete across filesystems. */
function moveEntry(string $source, string $target): void
{
    if (@rename($source, $target)) {
        return;
    }

    copyRecursively($source, $target);
    deleteRecursively($source);
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    respond(405, false, 'Method not allowed');
}

$providedToken = (string) ($_SERVER['HTTP_X_DEPLOY_TOKEN'] ?? '');

if ($providedToken === '' || ! hash_equals(DEPLOY_TOKEN_SHA256, hash('sha256', $providedToken))) {
    respond(403, false, 'Forbidden');
}

@set_time_limit(0);
ignore_user_abort(true);

$appPath = rtrim(DEPLOY_APP_PATH, '/');
$webPath = __DIR__;
$deployDir = $appPath.'/storage/app/deploy';
$zipPath = $deployDir.'/release.zip';
$extractPath = $deployDir.'/release';
$previousPath = $deployDir.'/previous';

try {
    logStep('PHP '.PHP_VERSION.' | app: '.$appPath.' | web: '.$webPath);

    if (! class_exists(ZipArchive::class)) {
        throw new RuntimeException('Extensão zip (ZipArchive) não está habilitada no PHP.');
    }

    if (! is_file($appPath.'/.env')) {
        throw new RuntimeException("Arquivo .env não encontrado em {$appPath}. Confira o secret DEPLOY_APP_PATH.");
    }

    if (! is_file($zipPath)) {
        throw new RuntimeException("Pacote não encontrado em {$zipPath}.");
    }

    // 1. Extract release
    deleteRecursively($extractPath);
    $zip = new ZipArchive;

    if ($zip->open($zipPath) !== true) {
        throw new RuntimeException('Não foi possível abrir o release.zip.');
    }

    if (! $zip->extractTo($extractPath)) {
        throw new RuntimeException('Falha ao extrair o release.zip.');
    }

    $zip->close();

    $meta = json_decode((string) @file_get_contents($extractPath.'/release-meta.json'), true) ?: [];
    logStep('Release extraído: commit '.($meta['commit'] ?? '?'));

    $requiredPhp = (int) ($meta['php_version_id'] ?? 0);

    if ($requiredPhp > 0 && PHP_VERSION_ID < $requiredPhp) {
        throw new RuntimeException("O release exige PHP_VERSION_ID >= {$requiredPhp}, mas o servidor roda ".PHP_VERSION.'.');
    }

    // 2. Swap application entries, keeping the previous version for rollback
    deleteRecursively($previousPath);
    mkdir($previousPath, 0755, true);
    $swapped = [];

    try {
        foreach (SWAPPED_APP_ENTRIES as $entry) {
            if (! file_exists($extractPath.'/'.$entry)) {
                continue;
            }

            if (file_exists($appPath.'/'.$entry)) {
                moveEntry($appPath.'/'.$entry, $previousPath.'/'.$entry);
            }

            moveEntry($extractPath.'/'.$entry, $appPath.'/'.$entry);
            $swapped[] = $entry;
        }
    } catch (Throwable $swapError) {
        foreach (array_reverse($swapped) as $entry) {
            deleteRecursively($appPath.'/'.$entry);

            if (file_exists($previousPath.'/'.$entry)) {
                moveEntry($previousPath.'/'.$entry, $appPath.'/'.$entry);
            }
        }

        throw new RuntimeException('Falha ao trocar arquivos (rollback aplicado): '.$swapError->getMessage(), 0, $swapError);
    }

    logStep('Aplicação atualizada: '.implode(', ', $swapped));

    // 3. Public assets in the web directory
    $releasePublic = $appPath.'/public';

    foreach (new DirectoryIterator($releasePublic) as $item) {
        if ($item->isDot()) {
            continue;
        }

        $name = $item->getFilename();
        $target = $webPath.'/'.$name;

        if (in_array($name, PRESERVED_WEB_FILES, true) && file_exists($target)) {
            continue;
        }

        if ($item->isDir()) {
            $staging = $target.'.new';
            deleteRecursively($staging);
            copyRecursively($item->getPathname(), $staging);
            deleteRecursively($target.'.old');

            if (file_exists($target)) {
                rename($target, $target.'.old');
            }

            rename($staging, $target);
            deleteRecursively($target.'.old');
        } else {
            copyRecursively($item->getPathname(), $target);
        }
    }

    logStep('Arquivos públicos atualizados em '.$webPath);

    if (function_exists('opcache_reset')) {
        @opcache_reset();
    }

    // 4. Boot the new app and run Artisan commands
    require $appPath.'/vendor/autoload.php';
    $app = require $appPath.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    $commands = [
        ['optimize:clear', []],
        ['migrate', ['--force' => true]],
        ['optimize', []],
        ['queue:restart', []],
    ];

    foreach ($commands as [$command, $arguments]) {
        $output = new Symfony\Component\Console\Output\BufferedOutput;
        $exitCode = $kernel->call($command, $arguments, $output);
        logStep("artisan {$command} (exit {$exitCode})\n".trim($output->fetch()));

        if ($exitCode !== 0) {
            throw new RuntimeException("artisan {$command} falhou.");
        }
    }

    // 5. Cleanup (previous/ is kept for manual rollback)
    deleteRecursively($extractPath);
    @unlink($zipPath);
    logStep('Deploy concluído.');

    respond(200, true);
} catch (Throwable $exception) {
    logStep('ERRO: '.$exception->getMessage());
    respond(500, false, $exception->getMessage());
}
