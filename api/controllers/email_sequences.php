<?php

class Email_sequencesController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $where = ['account_id = ?']; $params = [currentAccountId()];
        if (!empty($_GET['persona_id'])) { $where[] = 'persona_id = ?'; $params[] = (int)$_GET['persona_id']; }
        if (!empty($_GET['trigger_type'])) { $where[] = 'trigger_type = ?'; $params[] = $_GET['trigger_type']; }
        $sql = 'SELECT s.*,
                (SELECT COUNT(*) FROM sequence_steps WHERE sequence_id = s.id) AS step_count,
                (SELECT COUNT(*) FROM sequence_enrollments WHERE sequence_id = s.id AND status="active") AS active_enrollments
                FROM email_sequences s WHERE ' . implode(' AND ', $where) . ' ORDER BY s.name';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['data' => $stmt->fetchAll()]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare('SELECT * FROM email_sequences WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        $seq = $stmt->fetch();
        if (!$seq) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        $steps = $this->db->prepare(
            'SELECT ss.*, et.name AS template_name, et.subject AS template_subject
             FROM sequence_steps ss
             LEFT JOIN email_templates et ON et.id = ss.email_template_id
             WHERE ss.sequence_id = ? ORDER BY ss.step_order'
        );
        $steps->execute([(int)$id]);
        $seq['steps'] = $steps->fetchAll();
        echo json_encode(['data' => $seq]);
    }

    public function store(): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $slug = trim($b['slug'] ?? '');
        $name = trim($b['name'] ?? '');
        if (!$slug || !$name) { http_response_code(422); echo json_encode(['error' => 'slug + name required']); return; }
        $stmt = $this->db->prepare(
            'INSERT INTO email_sequences (account_id, slug, name, description, trigger_type, persona_id, product_id, is_active, total_steps)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)'
        );
        $stmt->execute([currentAccountId(), $slug, $name, $b['description'] ?? null,
            $b['trigger_type'] ?? 'manual', $b['persona_id'] ?? null, $b['product_id'] ?? null, $b['is_active'] ?? 1]);
        http_response_code(201);
        echo json_encode(['data' => ['id' => (int)$this->db->lastInsertId()]]);
    }

    public function update(string $id): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = []; $params = [];
        foreach (['slug','name','description','trigger_type','persona_id','product_id','is_active'] as $f) {
            if (array_key_exists($f, $b)) { $fields[] = "$f = ?"; $params[] = $b[$f]; }
        }
        if (!$fields) { echo json_encode(['data' => ['updated' => 0]]); return; }
        $params[] = (int)$id; $params[] = currentAccountId();
        $stmt = $this->db->prepare('UPDATE email_sequences SET ' . implode(', ', $fields) . ' WHERE id = ? AND account_id = ?');
        $stmt->execute($params);
        echo json_encode(['data' => ['updated' => $stmt->rowCount()]]);
    }

    public function destroy(string $id): void {
        $stmt = $this->db->prepare('DELETE FROM email_sequences WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        echo json_encode(['data' => ['deleted' => $stmt->rowCount()]]);
    }
}
