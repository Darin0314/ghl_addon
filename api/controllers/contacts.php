<?php

class ContactsController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $where  = [];
        $params = [];

        if (!empty($_GET['search'])) {
            $s = '%' . $_GET['search'] . '%';
            $where[]  = '(name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            $params[] = $s; $params[] = $s; $params[] = $s;
        }
        if (!empty($_GET['stage'])) {
            $where[]  = 'pipeline_stage_id = ?';
            $params[] = (int)$_GET['stage'];
        }
        if (!empty($_GET['tag'])) {
            $where[]  = 'JSON_CONTAINS(tags, ?)';
            $params[] = json_encode($_GET['tag']);
        }

        $sql = 'SELECT * FROM contacts';
        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        $sql .= ' ORDER BY created_at DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        foreach ($rows as &$r) {
            $r['tags'] = $r['tags'] ? json_decode($r['tags'], true) : [];
        }

        echo json_encode(['data' => $rows]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare('SELECT * FROM contacts WHERE id = ?');
        $stmt->execute([(int)$id]);
        $row = $stmt->fetch();
        if (!$row) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        $row['tags'] = $row['tags'] ? json_decode($row['tags'], true) : [];
        echo json_encode(['data' => $row]);
    }

    public function store(): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $name = trim($body['name'] ?? '');
        if (!$name) { http_response_code(422); echo json_encode(['error' => 'Name required']); return; }

        $stmt = $this->db->prepare(
            'INSERT INTO contacts (name, email, phone, source, tags, pipeline_stage_id, notes, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $name,
            $body['email'] ?? null,
            $body['phone'] ?? null,
            $body['source'] ?? null,
            isset($body['tags']) ? json_encode($body['tags']) : json_encode([]),
            $body['pipeline_stage_id'] ?? null,
            $body['notes'] ?? null,
            $body['created_by'] ?? null,
        ]);
        $id = $this->db->lastInsertId();
        http_response_code(201);
        echo json_encode(['data' => ['id' => (int)$id]]);
    }

    public function update(string $id): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = []; $params = [];

        foreach (['name','email','phone','source','notes'] as $f) {
            if (array_key_exists($f, $body)) { $fields[] = "$f = ?"; $params[] = $body[$f]; }
        }
        if (array_key_exists('tags', $body)) {
            $fields[] = 'tags = ?'; $params[] = json_encode($body['tags']);
        }
        if (array_key_exists('pipeline_stage_id', $body)) {
            $fields[] = 'pipeline_stage_id = ?'; $params[] = $body['pipeline_stage_id'];
        }
        if (!$fields) { echo json_encode(['data' => []]); return; }

        $params[] = (int)$id;
        $this->db->prepare('UPDATE contacts SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
        echo json_encode(['data' => ['updated' => true]]);
    }

    public function destroy(string $id): void {
        $this->db->prepare('DELETE FROM contacts WHERE id = ?')->execute([(int)$id]);
        echo json_encode(['data' => ['deleted' => true]]);
    }
}
