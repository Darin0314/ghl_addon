<?php

class AutomationsController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $stmt = $this->db->prepare(
            'SELECT a.*,
              (SELECT COUNT(*) FROM automation_runs r WHERE r.automation_id = a.id AND r.status = "running") AS active_runs
             FROM automations a WHERE account_id = ? ORDER BY name'
        );
        $stmt->execute([currentAccountId()]);
        echo json_encode(['data' => $stmt->fetchAll()]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare('SELECT * FROM automations WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        $a = $stmt->fetch();
        if (!$a) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }

        $nodes = $this->db->prepare('SELECT * FROM automation_nodes WHERE automation_id = ?');
        $nodes->execute([(int)$id]);
        $edges = $this->db->prepare('SELECT * FROM automation_edges WHERE automation_id = ?');
        $edges->execute([(int)$id]);
        $a['trigger_config'] = $a['trigger_config'] ? json_decode($a['trigger_config'], true) : null;
        $a['nodes'] = array_map(function ($n) {
            $n['config'] = $n['config'] ? json_decode($n['config'], true) : null;
            return $n;
        }, $nodes->fetchAll());
        $a['edges'] = $edges->fetchAll();
        echo json_encode(['data' => $a]);
    }

    public function store(): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $stmt = $this->db->prepare(
            'INSERT INTO automations (account_id, slug, name, description, trigger_type, trigger_config, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            currentAccountId(),
            $b['slug'] ?? 'untitled-' . bin2hex(random_bytes(3)),
            $b['name'] ?? 'Untitled automation',
            $b['description'] ?? null,
            $b['trigger_type'] ?? 'manual',
            isset($b['trigger_config']) ? json_encode($b['trigger_config']) : null,
            $b['is_active'] ?? 1,
        ]);
        http_response_code(201);
        echo json_encode(['data' => ['id' => (int)$this->db->lastInsertId()]]);
    }

    public function update(string $id): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = []; $params = [];
        foreach (['name','description','trigger_type','is_active','slug'] as $f) {
            if (array_key_exists($f, $b)) { $fields[] = "$f = ?"; $params[] = $b[$f]; }
        }
        if (array_key_exists('trigger_config', $b)) { $fields[] = 'trigger_config = ?'; $params[] = json_encode($b['trigger_config']); }
        if ($fields) {
            $params[] = (int)$id; $params[] = currentAccountId();
            $stmt = $this->db->prepare('UPDATE automations SET ' . implode(', ', $fields) . ' WHERE id = ? AND account_id = ?');
            $stmt->execute($params);
        }
        if (isset($b['nodes']) && is_array($b['nodes'])) {
            $this->db->prepare('DELETE FROM automation_nodes WHERE automation_id = ?')->execute([(int)$id]);
            $ins = $this->db->prepare('INSERT INTO automation_nodes (automation_id, node_key, node_type, position_x, position_y, config) VALUES (?, ?, ?, ?, ?, ?)');
            foreach ($b['nodes'] as $n) {
                $ins->execute([(int)$id, $n['node_key'], $n['node_type'], $n['position_x'] ?? 0, $n['position_y'] ?? 0, isset($n['config']) ? json_encode($n['config']) : null]);
            }
        }
        if (isset($b['edges']) && is_array($b['edges'])) {
            $this->db->prepare('DELETE FROM automation_edges WHERE automation_id = ?')->execute([(int)$id]);
            $ins = $this->db->prepare('INSERT INTO automation_edges (automation_id, from_node_key, to_node_key, branch) VALUES (?, ?, ?, ?)');
            foreach ($b['edges'] as $e) {
                $ins->execute([(int)$id, $e['from_node_key'], $e['to_node_key'], $e['branch'] ?? 'default']);
            }
        }
        echo json_encode(['data' => ['ok' => true]]);
    }

    public function destroy(string $id): void {
        $stmt = $this->db->prepare('DELETE FROM automations WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        echo json_encode(['data' => ['deleted' => $stmt->rowCount()]]);
    }
}
