<?php

class Section_helpController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $where = ['account_id = ?', 'is_active = 1']; $params = [currentAccountId()];
        if (!empty($_GET['section_key'])) { $where[] = 'section_key = ?'; $params[] = $_GET['section_key']; }
        $sql = 'SELECT sh.*,
                (SELECT 1 FROM section_help_dismissals d WHERE d.section_key = sh.section_key AND d.version = sh.version AND d.user_id = ? LIMIT 1) AS dismissed
                FROM section_help sh WHERE ' . implode(' AND ', $where) . ' ORDER BY sh.section_key';
        $params2 = array_merge([(int)currentUser()['id']], $params);
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params2);
        echo json_encode(['data' => $stmt->fetchAll()]);
    }

    public function show(string $key): void {
        $stmt = $this->db->prepare(
            'SELECT sh.*,
             (SELECT 1 FROM section_help_dismissals d WHERE d.section_key = sh.section_key AND d.version = sh.version AND d.user_id = ? LIMIT 1) AS dismissed
             FROM section_help sh WHERE sh.section_key = ? AND sh.account_id = ? AND sh.is_active = 1 LIMIT 1'
        );
        $stmt->execute([(int)currentUser()['id'], $key, currentAccountId()]);
        $r = $stmt->fetch();
        if (!$r) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        echo json_encode(['data' => $r]);
    }

    public function store(): void {
        // POST /api/section_help/{key}/dismiss — body { version: N }
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $key = $b['section_key'] ?? '';
        $version = (int)($b['version'] ?? 1);
        if (!$key) { http_response_code(422); echo json_encode(['error' => 'section_key required']); return; }
        $stmt = $this->db->prepare(
            'INSERT IGNORE INTO section_help_dismissals (account_id, user_id, section_key, version)
             VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([currentAccountId(), (int)currentUser()['id'], $key, $version]);
        echo json_encode(['data' => ['dismissed' => true]]);
    }

    public function update(string $id): void { http_response_code(405); echo json_encode(['error' => 'not supported']); }
    public function destroy(string $id): void {
        // Re-enable (remove dismissal) so user sees the bubble again
        $stmt = $this->db->prepare('DELETE FROM section_help_dismissals WHERE user_id = ? AND section_key = ?');
        $stmt->execute([(int)currentUser()['id'], $id]);
        echo json_encode(['data' => ['restored' => $stmt->rowCount()]]);
    }
}
