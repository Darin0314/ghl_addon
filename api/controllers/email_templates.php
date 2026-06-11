<?php

class Email_templatesController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $where = ['account_id = ?'];
        $params = [currentAccountId()];
        if (!empty($_GET['category'])) { $where[] = 'category = ?'; $params[] = $_GET['category']; }
        if (!empty($_GET['persona_id'])) { $where[] = 'persona_id = ?'; $params[] = (int)$_GET['persona_id']; }
        if (!empty($_GET['product_id'])) { $where[] = 'product_id = ?'; $params[] = (int)$_GET['product_id']; }
        if (!empty($_GET['search'])) {
            $s = '%' . $_GET['search'] . '%';
            $where[] = '(name LIKE ? OR subject LIKE ? OR body_md LIKE ?)';
            $params[] = $s; $params[] = $s; $params[] = $s;
        }
        $sql = 'SELECT id, slug, name, subject, preview_text, category, persona_id, product_id, is_active, updated_at
                FROM email_templates WHERE ' . implode(' AND ', $where) . ' ORDER BY category, name';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['data' => $stmt->fetchAll()]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare('SELECT * FROM email_templates WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        $row = $stmt->fetch();
        if (!$row) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        echo json_encode(['data' => $row]);
    }

    public function store(): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $slug = trim($b['slug'] ?? '');
        $name = trim($b['name'] ?? '');
        $subject = trim($b['subject'] ?? '');
        $body = $b['body_md'] ?? '';
        if (!$slug || !$name || !$subject) {
            http_response_code(422); echo json_encode(['error' => 'slug, name, subject required']); return;
        }
        $stmt = $this->db->prepare(
            'INSERT INTO email_templates (account_id, slug, name, subject, preview_text, body_md, body_html, category, persona_id, product_id, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            currentAccountId(), $slug, $name, $subject,
            $b['preview_text'] ?? null,
            $body,
            $b['body_html'] ?? null,
            $b['category'] ?? null,
            $b['persona_id'] ?? null,
            $b['product_id'] ?? null,
            $b['is_active'] ?? 1,
        ]);
        http_response_code(201);
        echo json_encode(['data' => ['id' => (int)$this->db->lastInsertId()]]);
    }

    public function update(string $id): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = []; $params = [];
        foreach (['slug','name','subject','preview_text','body_md','body_html','category','persona_id','product_id','is_active'] as $f) {
            if (array_key_exists($f, $b)) { $fields[] = "$f = ?"; $params[] = $b[$f]; }
        }
        if (!$fields) { echo json_encode(['data' => ['updated' => 0]]); return; }
        $params[] = (int)$id; $params[] = currentAccountId();
        $stmt = $this->db->prepare('UPDATE email_templates SET ' . implode(', ', $fields) . ' WHERE id = ? AND account_id = ?');
        $stmt->execute($params);
        echo json_encode(['data' => ['updated' => $stmt->rowCount()]]);
    }

    public function destroy(string $id): void {
        $stmt = $this->db->prepare('DELETE FROM email_templates WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        echo json_encode(['data' => ['deleted' => $stmt->rowCount()]]);
    }
}
