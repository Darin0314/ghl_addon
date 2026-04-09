<?php

require_once __DIR__ . '/middleware/cors.php';
require_once __DIR__ . '/config/database.php';

applyCors();
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = preg_replace('#^/api#', '', $uri);
$parts  = explode('/', trim($uri, '/'));
$resource = $parts[0] ?? '';
$id       = $parts[1] ?? null;

// Auto-load controller
$controllerFile = __DIR__ . "/controllers/{$resource}.php";
if ($resource && file_exists($controllerFile)) {
    require_once $controllerFile;
    $class = ucfirst($resource) . 'Controller';
    if (class_exists($class)) {
        $controller = new $class(Database::getConnection());
        match ($method) {
            'GET'    => $id ? $controller->show($id) : $controller->index(),
            'POST'   => $controller->store(),
            'PUT'    => $controller->update($id),
            'DELETE' => $controller->destroy($id),
            default  => http_response_code(405),
        };
        exit;
    }
}

// Health check
if ($resource === 'health') {
    echo json_encode(['status' => 'ok', 'timestamp' => date('c')]);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
