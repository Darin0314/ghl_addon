<?php

class Content_calendarController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $where = ['account_id = ?']; $params = [currentAccountId()];
        if (!empty($_GET['from'])) { $where[] = 'scheduled_date >= ?'; $params[] = $_GET['from']; }
        if (!empty($_GET['to']))   { $where[] = 'scheduled_date <= ?'; $params[] = $_GET['to']; }
        if (!empty($_GET['status'])) { $where[] = 'status = ?'; $params[] = $_GET['status']; }
        if (!empty($_GET['funnel_stage'])) { $where[] = 'funnel_stage = ?'; $params[] = $_GET['funnel_stage']; }
        $sql = 'SELECT * FROM content_calendar WHERE ' . implode(' AND ', $where) . ' ORDER BY scheduled_date ASC';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['data' => $stmt->fetchAll()]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare('SELECT * FROM content_calendar WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        $r = $stmt->fetch();
        if (!$r) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        echo json_encode(['data' => $r]);
    }

    public function store(): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $stmt = $this->db->prepare(
            'INSERT INTO content_calendar (account_id, scheduled_date, content_type, title, target_keyword, search_volume, target_persona_id, target_product_id, funnel_stage, status, assigned_to, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            currentAccountId(), $b['scheduled_date'] ?? date('Y-m-d'),
            $b['content_type'] ?? 'blog', $b['title'] ?? '',
            $b['target_keyword'] ?? null, $b['search_volume'] ?? null,
            $b['target_persona_id'] ?? null, $b['target_product_id'] ?? null,
            $b['funnel_stage'] ?? 'top', $b['status'] ?? 'idea',
            $b['assigned_to'] ?? null, $b['notes'] ?? null,
        ]);
        http_response_code(201);
        echo json_encode(['data' => ['id' => (int)$this->db->lastInsertId()]]);
    }

    public function update(string $id): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = []; $params = [];
        foreach (['scheduled_date','content_type','title','target_keyword','search_volume','target_persona_id','target_product_id','funnel_stage','status','assigned_to','url','notes'] as $f) {
            if (array_key_exists($f, $b)) { $fields[] = "$f = ?"; $params[] = $b[$f]; }
        }
        if (!$fields) { echo json_encode(['data' => ['updated' => 0]]); return; }
        $params[] = (int)$id; $params[] = currentAccountId();
        $stmt = $this->db->prepare('UPDATE content_calendar SET ' . implode(', ', $fields) . ' WHERE id = ? AND account_id = ?');
        $stmt->execute($params);
        echo json_encode(['data' => ['updated' => $stmt->rowCount()]]);
    }

    public function destroy(string $id): void {
        $stmt = $this->db->prepare('DELETE FROM content_calendar WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        echo json_encode(['data' => ['deleted' => $stmt->rowCount()]]);
    }
}
