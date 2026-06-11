<?php

class Ad_pixelsController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $stmt = $this->db->prepare(
            'SELECT ap.*,
             (SELECT COUNT(*) FROM pixel_events pe WHERE pe.account_id = ap.account_id AND pe.platform = ap.platform AND pe.created_at > NOW() - INTERVAL 30 DAY) AS events_30d
             FROM ad_pixels ap WHERE account_id = ? ORDER BY platform'
        );
        $stmt->execute([currentAccountId()]);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['config'] = $r['config'] ? json_decode($r['config'], true) : null;
            // Mask the secret token in list response — admin clicks "Reveal" if they need it
            if (!empty($r['conversion_api_token'])) {
                $r['conversion_api_token_masked'] = '••••••' . substr($r['conversion_api_token'], -4);
                unset($r['conversion_api_token']);
            }
        }
        echo json_encode(['data' => $rows]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare('SELECT * FROM ad_pixels WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        $r = $stmt->fetch();
        if (!$r) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        $r['config'] = $r['config'] ? json_decode($r['config'], true) : null;
        echo json_encode(['data' => $r]);
    }

    public function store(): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $stmt = $this->db->prepare(
            'INSERT INTO ad_pixels (account_id, platform, pixel_id, dataset_id, conversion_api_token, test_event_code, is_active, config, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE
              pixel_id = VALUES(pixel_id), dataset_id = VALUES(dataset_id),
              conversion_api_token = COALESCE(VALUES(conversion_api_token), conversion_api_token),
              test_event_code = VALUES(test_event_code),
              is_active = VALUES(is_active), config = VALUES(config), notes = VALUES(notes)'
        );
        $stmt->execute([
            currentAccountId(),
            $b['platform'],
            $b['pixel_id'] ?? null,
            $b['dataset_id'] ?? null,
            !empty($b['conversion_api_token']) ? $b['conversion_api_token'] : null,
            $b['test_event_code'] ?? null,
            $b['is_active'] ?? 0,
            isset($b['config']) ? json_encode($b['config']) : null,
            $b['notes'] ?? null,
        ]);
        echo json_encode(['data' => ['ok' => true]]);
    }

    public function update(string $id): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = []; $params = [];
        foreach (['pixel_id','dataset_id','test_event_code','is_active','notes'] as $f) {
            if (array_key_exists($f, $b)) { $fields[] = "$f = ?"; $params[] = $b[$f]; }
        }
        if (array_key_exists('config', $b)) { $fields[] = 'config = ?'; $params[] = json_encode($b['config']); }
        if (!empty($b['conversion_api_token'])) { $fields[] = 'conversion_api_token = ?'; $params[] = $b['conversion_api_token']; }
        if (!$fields) { echo json_encode(['data' => ['updated' => 0]]); return; }
        $params[] = (int)$id; $params[] = currentAccountId();
        $stmt = $this->db->prepare('UPDATE ad_pixels SET ' . implode(', ', $fields) . ' WHERE id = ? AND account_id = ?');
        $stmt->execute($params);
        echo json_encode(['data' => ['updated' => $stmt->rowCount()]]);
    }

    public function destroy(string $id): void {
        $stmt = $this->db->prepare('UPDATE ad_pixels SET is_active = 0, pixel_id = NULL, conversion_api_token = NULL WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        echo json_encode(['data' => ['cleared' => $stmt->rowCount()]]);
    }
}
