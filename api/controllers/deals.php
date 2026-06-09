<?php

/**
 * Deals (opportunities) endpoints — drives the Pipeline kanban.
 * Routes resolved by api/index.php:
 *   GET    /api/deals                          — list (with contact + last-call info)
 *   GET    /api/deals/{id}                     — single
 *   POST   /api/deals                          — create
 *   PUT    /api/deals/{id}                     — update (drag-stage uses this)
 *   DELETE /api/deals/{id}                     — remove
 */
class DealsController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $where = [];
        $params = [];
        if (!empty($_GET['pipeline_id'])) {
            $where[]  = 'd.pipeline_id = ?';
            $params[] = (int)$_GET['pipeline_id'];
        }
        if (!empty($_GET['status'])) {
            $where[]  = 'd.status = ?';
            $params[] = $_GET['status'];
        }

        $sql = "SELECT d.*,
                       c.name  AS contact_name,
                       c.phone AS contact_phone,
                       c.email AS contact_email,
                       (SELECT MAX(started_at) FROM call_logs cl
                          WHERE cl.contact_id = d.contact_id) AS last_call_at,
                       (SELECT direction FROM call_logs cl
                          WHERE cl.contact_id = d.contact_id
                          ORDER BY started_at DESC LIMIT 1) AS last_call_direction
                FROM deals d
                LEFT JOIN contacts c ON c.id = d.contact_id";
        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        $sql .= ' ORDER BY d.stage_id, d.updated_at DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['data' => $stmt->fetchAll()]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare(
            "SELECT d.*, c.name AS contact_name, c.phone AS contact_phone, c.email AS contact_email
             FROM deals d LEFT JOIN contacts c ON c.id = d.contact_id
             WHERE d.id = ?"
        );
        $stmt->execute([(int)$id]);
        $row = $stmt->fetch();
        if (!$row) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        echo json_encode(['data' => $row]);
    }

    public function store(): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $contactId = (int)($body['contact_id'] ?? 0);
        $title     = trim($body['title'] ?? '');
        if (!$contactId || !$title) {
            http_response_code(422);
            echo json_encode(['error' => 'contact_id and title required']);
            return;
        }
        // Default pipeline + first stage when not supplied
        $pipelineId = (int)($body['pipeline_id'] ?? 0);
        $stageId    = (int)($body['stage_id'] ?? 0);
        if (!$pipelineId) {
            $row = $this->db->query("SELECT id FROM pipelines WHERE is_default = 1 LIMIT 1")->fetch();
            $pipelineId = (int)($row['id'] ?? 1);
        }
        if (!$stageId) {
            $stmt = $this->db->prepare("SELECT id FROM pipeline_stages WHERE pipeline_id = ? ORDER BY sort_order ASC LIMIT 1");
            $stmt->execute([$pipelineId]);
            $stageId = (int)($stmt->fetch()['id'] ?? 0);
        }

        $stmt = $this->db->prepare(
            'INSERT INTO deals (contact_id, pipeline_id, stage_id, title, value, expected_close, status, notes, assigned_to)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $contactId, $pipelineId, $stageId, $title,
            (float)($body['value'] ?? 0),
            $body['expected_close'] ?? null,
            $body['status'] ?? 'open',
            $body['notes'] ?? null,
            !empty($body['assigned_to']) ? (int)$body['assigned_to'] : null,
        ]);
        $id = (int)$this->db->lastInsertId();
        http_response_code(201);
        echo json_encode(['data' => ['id' => $id]]);
    }

    public function update(string $id): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        // Whitelist of editable fields — drag-stage hits this with just
        // {stage_id} so the partial-update is the hot path.
        $allowed = ['contact_id','pipeline_id','stage_id','title','value','expected_close','status','notes','assigned_to'];
        $sets = [];
        $params = [];
        foreach ($allowed as $k) {
            if (array_key_exists($k, $body)) {
                $sets[] = "$k = ?";
                $params[] = $body[$k];
            }
        }
        if (!$sets) { echo json_encode(['data' => ['updated' => 0]]); return; }
        $params[] = (int)$id;
        $stmt = $this->db->prepare('UPDATE deals SET ' . implode(', ', $sets) . ' WHERE id = ?');
        $stmt->execute($params);
        echo json_encode(['data' => ['updated' => $stmt->rowCount()]]);
    }

    public function destroy(string $id): void {
        $stmt = $this->db->prepare('DELETE FROM deals WHERE id = ?');
        $stmt->execute([(int)$id]);
        echo json_encode(['data' => ['deleted' => $stmt->rowCount()]]);
    }
}
