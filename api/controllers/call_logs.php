<?php

/**
 * Call log endpoints. The frontend dialer (RingCentral Embeddable widget,
 * mounted in AppLayout) listens for rc-call-end-notify postMessage events
 * and POSTs each completed call here. Inbound + outbound + missed all flow
 * through the same endpoint.
 *
 * Routes (resolved by api/index.php):
 *   GET    /api/call_logs                       — list (filterable by contact_id, phone, since, thru)
 *   GET    /api/call_logs/{id}                  — single record
 *   POST   /api/call_logs                       — create
 *   PUT    /api/call_logs/{id}                  — update notes/result
 *   DELETE /api/call_logs/{id}                  — remove
 */
class Call_logsController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        // ?stats=today — small summary for dashboard widget. Includes
        // recent 8 calls so the dashboard can render a feed without a
        // second round-trip.
        if (!empty($_GET['stats']) && $_GET['stats'] === 'today') {
            $stmt = $this->db->prepare(
                "SELECT
                    COUNT(*) AS total,
                    SUM(direction = 'inbound')  AS inbound,
                    SUM(direction = 'outbound') AS outbound,
                    SUM(direction = 'missed')   AS missed,
                    COALESCE(SUM(duration_sec), 0) AS total_seconds
                 FROM call_logs
                 WHERE started_at >= ? AND started_at < ?"
            );
            $todayStart = date('Y-m-d 00:00:00');
            $tomorrow   = date('Y-m-d 00:00:00', strtotime('+1 day'));
            $stmt->execute([$todayStart, $tomorrow]);
            $summary = $stmt->fetch();
            // Recent feed — last 8, any day
            $recentStmt = $this->db->prepare(
                "SELECT cl.id, cl.direction, cl.phone_number, cl.duration_sec,
                        cl.started_at, cl.contact_id, c.name AS contact_name
                 FROM call_logs cl
                 LEFT JOIN contacts c ON c.id = cl.contact_id
                 ORDER BY cl.started_at DESC LIMIT 8"
            );
            $recentStmt->execute();
            echo json_encode(['data' => [
                'today'  => [
                    'total'         => (int)$summary['total'],
                    'inbound'       => (int)$summary['inbound'],
                    'outbound'      => (int)$summary['outbound'],
                    'missed'        => (int)$summary['missed'],
                    'total_seconds' => (int)$summary['total_seconds'],
                ],
                'recent' => $recentStmt->fetchAll(),
            ]]);
            return;
        }

        $where  = [];
        $params = [];

        // Role scoping — agents see only calls tied to their contacts or to
        // their own user_id (e.g. inbound calls before contact-match).
        $me = currentUser();
        if ($me && ($me['role'] ?? '') === 'agent') {
            $where[]  = '(cl.user_id = ? OR c.assigned_to = ?)';
            $params[] = (int)$me['id'];
            $params[] = (int)$me['id'];
        }

        if (!empty($_GET['contact_id'])) {
            $where[]  = 'cl.contact_id = ?';
            $params[] = (int)$_GET['contact_id'];
        }
        if (!empty($_GET['phone'])) {
            // Match against the digits only so 720-303-9999 == 7203039999
            $digits = preg_replace('/\D+/', '', $_GET['phone']);
            if ($digits !== '') {
                $where[]  = "REGEXP_REPLACE(cl.phone_number, '[^0-9]', '') LIKE ?";
                $params[] = '%' . $digits . '%';
            }
        }
        if (!empty($_GET['since'])) {
            $where[]  = 'cl.started_at >= ?';
            $params[] = $_GET['since'];
        }
        if (!empty($_GET['thru'])) {
            $where[]  = 'cl.started_at <= ?';
            $params[] = $_GET['thru'];
        }

        $sql = "SELECT cl.*, c.name AS contact_name
                FROM call_logs cl
                LEFT JOIN contacts c ON c.id = cl.contact_id";
        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        $sql .= ' ORDER BY cl.started_at DESC LIMIT 500';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['data' => $stmt->fetchAll()]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare(
            "SELECT cl.*, c.name AS contact_name
             FROM call_logs cl
             LEFT JOIN contacts c ON c.id = cl.contact_id
             WHERE cl.id = ?"
        );
        $stmt->execute([(int)$id]);
        $row = $stmt->fetch();
        if (!$row) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        echo json_encode(['data' => $row]);
    }

    public function store(): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $phone = preg_replace('/[^0-9+]/', '', $body['phone_number'] ?? '');
        if ($phone === '') { http_response_code(422); echo json_encode(['error' => 'phone_number required']); return; }

        $direction = $body['direction'] ?? 'outbound';
        if (!in_array($direction, ['inbound', 'outbound', 'missed'], true)) $direction = 'outbound';

        // Try to match the call to an existing contact by phone-number digits.
        $contactId = !empty($body['contact_id']) ? (int)$body['contact_id'] : null;
        if (!$contactId) {
            $digits = preg_replace('/\D+/', '', $phone);
            if (strlen($digits) >= 7) {
                $stmt = $this->db->prepare(
                    "SELECT id FROM contacts
                     WHERE REGEXP_REPLACE(phone, '[^0-9]', '') LIKE ?
                     ORDER BY updated_at DESC LIMIT 1"
                );
                $stmt->execute(['%' . substr($digits, -10) . '%']);
                $hit = $stmt->fetch();
                if ($hit) $contactId = (int)$hit['id'];
            }
        }

        // Idempotency — RC sometimes emits the call-end event twice on flaky
        // connections. If we already have a row with this session id, update
        // it instead of inserting a duplicate.
        $sessionId = $body['rc_session_id'] ?? null;
        if ($sessionId) {
            $stmt = $this->db->prepare('SELECT id FROM call_logs WHERE rc_session_id = ? LIMIT 1');
            $stmt->execute([$sessionId]);
            $existing = $stmt->fetch();
            if ($existing) { $this->update((string)$existing['id']); return; }
        }

        $stmt = $this->db->prepare(
            'INSERT INTO call_logs
              (contact_id, user_id, direction, phone_number, duration_sec,
               rc_session_id, rc_call_id, recording_url, result, notes,
               started_at, ended_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $contactId,
            !empty($body['user_id']) ? (int)$body['user_id'] : null,
            $direction,
            $phone,
            (int)($body['duration_sec'] ?? 0),
            $sessionId,
            $body['rc_call_id'] ?? null,
            $body['recording_url'] ?? null,
            $body['result'] ?? null,
            $body['notes'] ?? null,
            $body['started_at'] ?? date('Y-m-d H:i:s'),
            $body['ended_at']   ?? null,
        ]);
        $id = (int)$this->db->lastInsertId();
        http_response_code(201);
        echo json_encode(['data' => ['id' => $id, 'contact_id' => $contactId]]);
    }

    public function update(string $id): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $allowed = ['contact_id','user_id','direction','duration_sec','recording_url','result','notes','ended_at'];
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
        $stmt = $this->db->prepare('UPDATE call_logs SET ' . implode(', ', $sets) . ' WHERE id = ?');
        $stmt->execute($params);
        echo json_encode(['data' => ['updated' => $stmt->rowCount()]]);
    }

    public function destroy(string $id): void {
        $stmt = $this->db->prepare('DELETE FROM call_logs WHERE id = ?');
        $stmt->execute([(int)$id]);
        echo json_encode(['data' => ['deleted' => $stmt->rowCount()]]);
    }
}
