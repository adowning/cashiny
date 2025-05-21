<?php
// php_scripts/master_game_handler.php

/**
 * This script acts as the single entry point for Node.js to interact with the PHP game logic.
 * It is responsible for:
 * 1. Bootstrapping the Laravel application environment (CRITICAL).
 * 2. Reading the structured input (userId, gameId, phpInputCommandData) from Node.js (via STDIN).
 * 3. Setting up any necessary context for the PHP game classes (e.g., potentially mocking/setting Auth user).
 * 4. Invoking the main game server logic (VanguardLTE\Games\CleosHeartNG\Server).
 * 5. Capturing and returning the response from the game server logic to Node.js (via STDOUT).
 */

// == SECTION 1: LARAVEL BOOTSTRAP (NEEDS CAREFUL CONFIGURATION) ==
// This path should point to your Laravel project's public/index.php or a similar bootstrap script.
// The goal is to have the full Laravel environment (services, facades, .env, DB connections) available.

// OPTION A: If this script is placed *within* an existing Laravel project's structure
// (e.g., in a 'cli_handlers' directory at the Laravel project root)
// $laravelBootstrapPath = __DIR__ . '/../public/index.php'; // If master_game_handler is in project_root/cli_handlers
// require $laravelBootstrapPath;
// OR, more commonly for CLI tasks, bootstrap the console kernel or app directly:

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| Register The Auto Loader
|--------------------------------------------------------------------------
|
| Composer provides a convenient, automatically generated class loader for
| this application. We just need to utilize it! We'll simply require it
| into the script here so we don't need to manually load our classes.
|
*/
// THIS PATH IS CRITICAL: Adjust it to point to your Laravel project's vendor/autoload.php
// Example: If master_game_handler.php is in /var/www/laravel_project/php_scripts/
// then autoload.php might be /var/www/laravel_project/vendor/autoload.php
$autoloaderPath = __DIR__ . '/../vendor/autoload.php'; // Assumes php_scripts is a child of Laravel root
if (!file_exists($autoloaderPath)) {
    die("FATAL ERROR: Composer autoload not found at '{$autoloaderPath}'. Adjust the path in master_game_handler.php. Current __DIR__ is " . __DIR__);
}
require $autoloaderPath;

/*
|--------------------------------------------------------------------------
| Turn On The Lights
|--------------------------------------------------------------------------
|
| We need to illuminate PHP development, so let us turn on the lights.
| This bootstraps the framework and gets it ready for use, then it
| will load up this application so that we can run it and send
| the responses back to the browser and delight our users.
|
*/
// THIS PATH IS CRITICAL: Adjust it to point to your Laravel project's bootstrap/app.php
$appPath = __DIR__ . '/../bootstrap/app.php'; // Assumes php_scripts is a child of Laravel root
if (!file_exists($appPath)) {
    die("FATAL ERROR: Laravel bootstrap/app.php not found at '{$appPath}'. Adjust the path in master_game_handler.php.");
}
$app = require_once $appPath;


/*
|--------------------------------------------------------------------------
| Run The Application
|--------------------------------------------------------------------------
|
| Once we have the application, we can handle the incoming request using
| the application's HTTP kernel. Then, we will send the response back
| to this client's browser, allowing them to enjoy our application.
|
*/
// For CLI-like execution, we often use the Console Kernel or directly use $app services.
// We don't need to run the full HTTP kernel unless specific HTTP features are required by Server.php indirectly.
// $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
// $response = $kernel->handle($request = Illuminate\Http\Request::capture());
// $kernel->terminate($request, $response);

// Ensure base_path() and other helpers are available.
// Laravel's bootstrap should define these. If not, something is wrong with the bootstrap.
if (!function_exists('base_path')) {
    // This is a fallback and indicates a bootstrap issue.
    // It should point to the root of your Laravel project.
    function base_path($path = '') {
        return realpath(__DIR__ . '/..') . ($path ? DIRECTORY_SEPARATOR . $path : $path);
    }
    // Define storage_path as well, as Server.php uses it for logging
    if (!function_exists('storage_path')) {
        function storage_path($path = '') {
            return base_path('storage') . ($path ? DIRECTORY_SEPARATOR . $path : $path);
        }
    }
}
// == END SECTION 1 ==


// Set content type for the output that Node.js will receive
header('Content-Type: application/json');

// == SECTION 2: READ INPUT FROM NODE.JS ==
$stdin = file_get_contents('php://input');
$nodeInput = json_decode($stdin, true);

if (json_last_error() !== JSON_ERROR_NONE || !$nodeInput) {
    http_response_code(400);
    echo json_encode([
        'error' => 'PHP: Invalid JSON input from Node.js or empty input.',
        'json_error_message' => json_last_error_msg(),
        'received_stdin' => $stdin // Be careful with logging raw input in production
    ]);
    exit;
}

$userId = $nodeInput['userId'] ?? null;
$gameId = $nodeInput['gameId'] ?? null;
// This is the crucial part: phpInputCommandData is what Server.php's file_get_contents('php://input')
// *would have read* if it were called directly by an HTTP client.
// Our Node.js process is now acting as that client for Server.php, via this master handler.
$phpInputCommandData = $nodeInput['phpInputCommandData'] ?? null;

if (!$userId || !$gameId || $phpInputCommandData === null) {
    http_response_code(400);
    echo json_encode(['error' => 'PHP: Missing userId, gameId, or phpInputCommandData from Node.js.']);
    exit;
}
// == END SECTION 2 ==


// == SECTION 3: SETUP CONTEXT & CALL GAME SERVER LOGIC ==
try {
    // **Simulate Auth for Server.php**
    // Server.php uses `\Auth::id()`. We need to ensure the user is authenticated.
    // This requires the Laravel $app to be bootstrapped.
    if (class_exists(\VanguardLTE\User::class) && method_exists($app['auth'], 'loginUsingId')) {
        $user = \VanguardLTE\User::find($userId);
        if ($user) {
            $app['auth']->loginUsingId($userId); // Logs in the user for this "request"
            // error_log("PHP: Successfully authenticated user ID: " . \Auth::id()); // For debugging
        } else {
            throw new \Exception("PHP: User with ID '{$userId}' not found. Cannot authenticate for Server.php.");
        }
    } else {
         // error_log("PHP: VanguardLTE\User class or Auth::loginUsingId not available. Auth might not work.");
        // If you can't fully Auth, Server.php will likely fail at Auth::id().
        // You might need to modify Server.php or provide a mock Auth facade if full bootstrap is too complex.
    }


    // The `Server.php` script's `get()` method internally calls `file_get_contents('php://input')`.
    // To make this work, we need to ensure that when `Server.php` is included and its `get()` method is called,
    // the `php://input` stream contains the `$phpInputCommandData`.
    // This is tricky because `php://input` can typically only be read once.
    //
    // A robust way is to make `Server.php` more flexible, e.g., by allowing data to be passed in.
    // If we can't modify Server.php, we can try to "prime" `php://input`.
    // However, a more direct approach is to modify Server.php slightly if possible,
    // or ensure our execution context makes $phpInputCommandData available to it.
    //
    // For now, the current Node.js setup writes $nodeInput (which contains $phpInputCommandData)
    // to this master_game_handler.php's STDIN. So, when Server.php (called by this script)
    // reads php://input, it should get $phpInputCommandData.

    // Instantiate and call the game server logic
    // Ensure the namespace is correct and the class is autoloaded by Laravel.
    $gameServer = new \VanguardLTE\Games\CleosHeartNG\Server();

    // Capture output from Server.php's get() method, as it uses `echo`.
    ob_start();
    // The `get($request, $game)` method in Server.php:
    // - `$request` is not heavily used, mostly for `$_REQUEST` or `file_get_contents('php://input')`.
    // - `$game` is the gameId.
    // Since `Server.php` will read `php://input` (which contains our `$phpInputCommandData`),
    // we can pass `null` for `$request`.
    $gameServer->get(null, $gameId);
    $phpResponse = ob_get_clean();

    // `Server.php` prefixes its output with ':::'
    // Node.js side will handle stripping this prefix.
    echo $phpResponse;

} catch (\Throwable $e) { // Catching Throwable for PHP 7+ to get all errors/exceptions
    http_response_code(500);
    // error_log("PHP Exception: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine()); // Log to PHP error log
    echo json_encode([
        'error' => 'PHP: Exception occurred during game server processing.',
        'exception_message' => $e->getMessage(),
        'exception_file' => basename($e->getFile()), // Send only basename for security
        'exception_line' => $e->getLine(),
        // 'exception_trace' => $e->getTraceAsString() // Be cautious about sending full traces to client
    ]);
    exit;
}
// == END SECTION 3 ==

?>
