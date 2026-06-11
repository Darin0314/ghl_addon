<?php

class AppointmentsController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $where = ['account_id = ?']; $params = [currentAccountId()];
        if (!empty($_GET['from'])) { $where[] = 'starts_at >= ?'; $params[] = $_GET['from']; }
        if (!empty($_GET['to']))   { $where[] = 'starts_at <= ?'; $params[] = $_GET['to']; }
        if (!empty($_GET['status'])) { $where[] = 'status = ?'; $params[] = $_GET['status']; }
        $stmt = $this->db->prepare(
            'SELECT a.*, et.name AS event_type_name, et.color
             FROM appointments a LEFT JOIN event_types et ON et.id = a.event_type_id
             WHERE ' . implode(' AND ', $where) . ' ORDER BY starts_at DESC LIMIT 200'
        );
        $stmt->execute($params);
        echo json_encode(['data' => $stmt->fetchAll()]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare('SELECT * FROM appointments WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        $r = $stmt->fetch();
        if (!$r) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        echo json_encode(['data' => $r]);
    }

    public function store(): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $token = bin2hex(random_bytes(16));
        $stmt = $this->db->prepare(
            'INSERT INTO appointments (account_id, event_type_id, contact_id, invitee_name, invitee_email, invitee_phone, starts_at, ends_at, timezone, location_type, meeting_url, answers_json, notes, cancel_token)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            currentAccountId(),
            $b['event_type_id'] ?? null, $b['contact_id'] ?? null,
            $b['invitee_name'] ?? null, $b['invitee_email'] ?? null, $b['invitee_phone'] ?? null,
            $b['starts_at'], $b['ends_at'],
            $b['timezone'] ?? 'America/Denver',
            $b['location_type'] ?? null, $b['meeting_url'] ?? null,
            isset($b['answers']) ? json_encode($b['answers']) : null,
            $b['notes'] ?? null,
            $token,
        ]);
        http_response_code(201);
        echo json_encode(['data' => ['id' => (int)$this->db->lastInsertId(), 'cancel_token' => $token]]);
    }

    public function update(string $id): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = []; $params = [];
        foreach (['status','starts_at','ends_at','invitee_name','invitee_email','invitee_phone','meeting_url','notes'] as $f) {
            if (array_key_exists($f, $b)) { $fields[] = "$f = ?"; $params[] = $b[$f]; }
        }
        if (!$fields) { echo json_encode(['data' => ['updated' => 0]]); return; }
        $params[] = (int)$id; $params[] = currentAccountId();
        $stmt = $this->db->prepare('UPDATE appointments SET ' . implode(', ', $fields) . ' WHERE id = ? AND account_id = ?');
        $stmt->execute($params);
        echo json_encode(['data' => ['updated' => $stmt->rowCount()]]);
    }

    public function destroy(string $id): void {
        $stmt = $this->db->prepare('UPDATE appointments SET status = "cancelled" WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        echo json_encode(['data' => ['cancelled' => $stmt->rowCount()]]);
    }
}
