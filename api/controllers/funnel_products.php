<?php

class Funnel_productsController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $stmt = $this->db->prepare('SELECT * FROM funnel_products WHERE account_id = ? ORDER BY sort_order, id');
        $stmt->execute([currentAccountId()]);
        echo json_encode(['data' => $stmt->fetchAll()]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare('SELECT * FROM funnel_products WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        $r = $stmt->fetch();
        if (!$r) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        echo json_encode(['data' => $r]);
    }

    public function store(): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $stmt = $this->db->prepare(
            'INSERT INTO funnel_products (account_id, slug, name, tagline, primary_persona_id, monthly_price, yearly_price, sort_order, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            currentAccountId(),
            $b['slug'] ?? '',
            $b['name'] ?? '',
            $b['tagline'] ?? null,
            $b['primary_persona_id'] ?? null,
            $b['monthly_price'] ?? null,
            $b['yearly_price'] ?? null,
            $b['sort_order'] ?? 0,
            $b['is_active'] ?? 1,
        ]);
        http_response_code(201);
        echo json_encode(['data' => ['id' => (int)$this->db->lastInsertId()]]);
    }

    public function update(string $id): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = []; $params = [];
        foreach (['slug','name','tagline','primary_persona_id','monthly_price','yearly_price','sort_order','is_active'] as $f) {
            if (array_key_exists($f, $b)) { $fields[] = "$f = ?"; $params[] = $b[$f]; }
        }
        if (!$fields) { echo json_encode(['data' => ['updated' => 0]]); return; }
        $params[] = (int)$id; $params[] = currentAccountId();
        $stmt = $this->db->prepare('UPDATE funnel_products SET ' . implode(', ', $fields) . ' WHERE id = ? AND account_id = ?');
        $stmt->execute($params);
        echo json_encode(['data' => ['updated' => $stmt->rowCount()]]);
    }

    public function destroy(string $id): void {
        $stmt = $this->db->prepare('DELETE FROM funnel_products WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        echo json_encode(['data' => ['deleted' => $stmt->rowCount()]]);
    }
}
