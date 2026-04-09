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
$action   = $parts[2] ?? null;   // e.g. /api/contacts/bulk/tag

// Bulk actions
if ($resource === 'contacts' && $id === 'bulk' && $method === 'POST') {
    require_once __DIR__ . '/controllers/contacts.php';
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $ids  = array_map('intval', $body['ids'] ?? []);
    if (empty($ids)) { echo json_encode(['data' => []]); exit; }

    $db = Database::getConnection();
    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    switch ($action) {
        case 'delete':
            $db->prepare("DELETE FROM contacts WHERE id IN ($placeholders)")->execute($ids);
            break;
        case 'tag':
            $tag = $body['tag'] ?? '';
            if ($tag) {
                $stmt = $db->prepare("SELECT id, tags FROM contacts WHERE id IN ($placeholders)");
                $stmt->execute($ids);
                $upd = $db->prepare('UPDATE contacts SET tags = ? WHERE id = ?');
                foreach ($stmt->fetchAll() as $row) {
                    $tags = $row['tags'] ? json_decode($row['tags'], true) : [];
                    if (!in_array($tag, $tags)) $tags[] = $tag;
                    $upd->execute([json_encode($tags), $row['id']]);
                }
            }
            break;
        case 'stage':
            $stageId = (int)($body['pipeline_stage_id'] ?? 0);
            $db->prepare("UPDATE contacts SET pipeline_stage_id = ? WHERE id IN ($placeholders)")
               ->execute(array_merge([$stageId], $ids));
            break;
    }
    echo json_encode(['data' => ['updated' => count($ids)]]);
    exit;
}

// Handle hyphenated resource names (pipeline_stages → pipeline_stages.php)
$controllerFile = __DIR__ . "/controllers/{$resource}.php";
if ($resource && file_exists($controllerFile)) {
    require_once $controllerFile;
    // Build class name: pipeline_stages → Pipeline_stagesController
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
