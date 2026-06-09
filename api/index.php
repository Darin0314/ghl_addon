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

// CSV import + auto-distribute. Frontend parses the CSV in-browser and posts
// the rows array plus a distribution config; we batch-insert and round-robin
// (or equal-split / single-assignee) the assigned_to column.
//   POST /api/contacts/import
//     { rows: [{name, email, phone, source, notes, tags?}, ...],
//       agent_ids: [1,2,3,4], strategy: 'round_robin'|'equal'|'one',
//       skip_duplicates: true }
if ($resource === 'contacts' && $id === 'import' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $rows = is_array($body['rows'] ?? null) ? $body['rows'] : [];
    if (!$rows) { echo json_encode(['data' => ['created' => 0, 'skipped' => 0, 'assigned' => []]]); exit; }
    $agentIds       = array_values(array_filter(array_map('intval', $body['agent_ids'] ?? []), fn($v) => $v > 0));
    $strategy       = $body['strategy'] ?? 'round_robin';
    $skipDuplicates = !empty($body['skip_duplicates']);

    $db = Database::getConnection();

    // Pre-load existing phone digits if de-dupe requested.
    $existingDigits = [];
    if ($skipDuplicates) {
        foreach ($db->query("SELECT REGEXP_REPLACE(COALESCE(phone,''),'[^0-9]','') AS d FROM contacts")->fetchAll() as $r) {
            if ($r['d'] !== '') $existingDigits[$r['d']] = true;
        }
    }

    // Build assignment plan up-front so it's deterministic + we can return it.
    $plan = [];
    if ($agentIds) {
        $n = count($rows);
        $a = count($agentIds);
        if ($strategy === 'one') {
            $plan = array_fill(0, $n, $agentIds[0]);
        } elseif ($strategy === 'equal') {
            // Split as evenly as possible; remainder goes to the earlier agents.
            $base  = intdiv($n, $a);
            $extra = $n % $a;
            $i = 0;
            foreach ($agentIds as $idx => $agent) {
                $count = $base + ($idx < $extra ? 1 : 0);
                for ($k = 0; $k < $count; $k++) $plan[$i++] = $agent;
            }
        } else { // round_robin (default)
            for ($i = 0; $i < $n; $i++) $plan[$i] = $agentIds[$i % $a];
        }
    }

    $insert = $db->prepare(
        'INSERT INTO contacts (name, email, phone, source, tags, notes, assigned_to)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    $created = 0; $skipped = 0;
    $assignedCount = [];
    foreach ($rows as $i => $row) {
        $name = trim($row['name'] ?? '');
        if ($name === '') { $skipped++; continue; }
        $phone = trim($row['phone'] ?? '');
        if ($skipDuplicates && $phone !== '') {
            $digits = preg_replace('/\D+/', '', $phone);
            if ($digits !== '' && isset($existingDigits[$digits])) { $skipped++; continue; }
            if ($digits !== '') $existingDigits[$digits] = true;
        }
        $tags = $row['tags'] ?? null;
        if (is_array($tags)) $tags = json_encode($tags);
        elseif (is_string($tags) && $tags !== '') {
            $parts = array_values(array_filter(array_map('trim', explode(';', $tags))));
            $tags = $parts ? json_encode($parts) : null;
        } else $tags = null;

        $assignedTo = $plan[$i] ?? null;
        $insert->execute([
            $name,
            $row['email']  ?: null,
            $phone         ?: null,
            $row['source'] ?? null,
            $tags,
            $row['notes']  ?? null,
            $assignedTo,
        ]);
        $created++;
        if ($assignedTo) $assignedCount[$assignedTo] = ($assignedCount[$assignedTo] ?? 0) + 1;
    }
    echo json_encode(['data' => [
        'created'  => $created,
        'skipped'  => $skipped,
        'assigned' => $assignedCount,
    ]]);
    exit;
}

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
