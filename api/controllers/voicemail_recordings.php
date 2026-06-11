<?php

class Voicemail_recordingsController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $stmt = $this->db->prepare(
            'SELECT vr.*,
             (SELECT COUNT(*) FROM voicemail_drops vd WHERE vd.recording_id = vr.id) AS drops_count
             FROM voicemail_recordings vr WHERE account_id = ? ORDER BY name'
        );
        $stmt->execute([currentAccountId()]);
        echo json_encode(['data' => $stmt->fetchAll()]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare('SELECT * FROM voicemail_recordings WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        $r = $stmt->fetch();
        if (!$r) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        echo json_encode(['data' => $r]);
    }

    public function store(): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $stmt = $this->db->prepare(
            'INSERT INTO voicemail_recordings (account_id, slug, name, twilio_recording_sid, audio_url, duration_seconds, persona_id, product_id, transcript, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            currentAccountId(),
            $b['slug'] ?? '', $b['name'] ?? '',
            $b['twilio_recording_sid'] ?? null, $b['audio_url'] ?? null,
            $b['duration_seconds'] ?? null,
            $b['persona_id'] ?? null, $b['product_id'] ?? null,
            $b['transcript'] ?? null,
            $b['is_active'] ?? 1,
        ]);
        http_response_code(201);
        echo json_encode(['data' => ['id' => (int)$this->db->lastInsertId()]]);
    }

    public function update(string $id): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = []; $params = [];
        foreach (['slug','name','twilio_recording_sid','audio_url','duration_seconds','persona_id','product_id','transcript','is_active'] as $f) {
            if (array_key_exists($f, $b)) { $fields[] = "$f = ?"; $params[] = $b[$f]; }
        }
        if (!$fields) { echo json_encode(['data' => ['updated' => 0]]); return; }
        $params[] = (int)$id; $params[] = currentAccountId();
        $stmt = $this->db->prepare('UPDATE voicemail_recordings SET ' . implode(', ', $fields) . ' WHERE id = ? AND account_id = ?');
        $stmt->execute($params);
        echo json_encode(['data' => ['updated' => $stmt->rowCount()]]);
    }

    public function destroy(string $id): void {
        $stmt = $this->db->prepare('DELETE FROM voicemail_recordings WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        echo json_encode(['data' => ['deleted' => $stmt->rowCount()]]);
    }
}
