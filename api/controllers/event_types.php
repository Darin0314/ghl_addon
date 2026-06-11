<?php

class Event_typesController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $stmt = $this->db->prepare(
            'SELECT et.*, (SELECT COUNT(*) FROM appointments a WHERE a.event_type_id = et.id AND a.status = "booked") AS upcoming_count
             FROM event_types et WHERE account_id = ? ORDER BY sort_id'
        );
        // sort_id doesn't exist — use id
        $stmt = $this->db->prepare(
            'SELECT et.*, (SELECT COUNT(*) FROM appointments a WHERE a.event_type_id = et.id AND a.status = "booked") AS upcoming_count
             FROM event_types et WHERE account_id = ? ORDER BY id'
        );
        $stmt->execute([currentAccountId()]);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['questions'] = $r['questions_json'] ? json_decode($r['questions_json'], true) : [];
        }
        echo json_encode(['data' => $rows]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare('SELECT * FROM event_types WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        $r = $stmt->fetch();
        if (!$r) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        $r['questions'] = $r['questions_json'] ? json_decode($r['questions_json'], true) : [];
        echo json_encode(['data' => $r]);
    }

    public function store(): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $stmt = $this->db->prepare(
            'INSERT INTO event_types (account_id, user_id, slug, name, description, duration_minutes, buffer_before, buffer_after, min_notice_hours, max_advance_days, location_type, location_details, questions_json, redirect_url, color, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            currentAccountId(),
            (int)(currentUser()['id'] ?? 0),
            $b['slug'] ?? '', $b['name'] ?? '', $b['description'] ?? null,
            $b['duration_minutes'] ?? 30,
            $b['buffer_before'] ?? 0, $b['buffer_after'] ?? 0,
            $b['min_notice_hours'] ?? 4, $b['max_advance_days'] ?? 60,
            $b['location_type'] ?? 'zoom', $b['location_details'] ?? null,
            isset($b['questions']) ? json_encode($b['questions']) : null,
            $b['redirect_url'] ?? null, $b['color'] ?? '#6366f1',
            $b['is_active'] ?? 1,
        ]);
        http_response_code(201);
        echo json_encode(['data' => ['id' => (int)$this->db->lastInsertId()]]);
    }

    public function update(string $id): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = []; $params = [];
        foreach (['slug','name','description','duration_minutes','buffer_before','buffer_after','min_notice_hours','max_advance_days','location_type','location_details','redirect_url','color','is_active'] as $f) {
            if (array_key_exists($f, $b)) { $fields[] = "$f = ?"; $params[] = $b[$f]; }
        }
        if (array_key_exists('questions', $b)) { $fields[] = 'questions_json = ?'; $params[] = json_encode($b['questions']); }
        if (!$fields) { echo json_encode(['data' => ['updated' => 0]]); return; }
        $params[] = (int)$id; $params[] = currentAccountId();
        $stmt = $this->db->prepare('UPDATE event_types SET ' . implode(', ', $fields) . ' WHERE id = ? AND account_id = ?');
        $stmt->execute($params);
        echo json_encode(['data' => ['updated' => $stmt->rowCount()]]);
    }

    public function destroy(string $id): void {
        $stmt = $this->db->prepare('DELETE FROM event_types WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        echo json_encode(['data' => ['deleted' => $stmt->rowCount()]]);
    }
}
