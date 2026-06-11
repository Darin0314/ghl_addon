<?php

class Pricing_plansController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $where = ['pp.account_id = ?']; $params = [currentAccountId()];
        if (!empty($_GET['product_id'])) { $where[] = 'pp.product_id = ?'; $params[] = (int)$_GET['product_id']; }
        $sql = 'SELECT pp.*, fp.name AS product_name, fp.slug AS product_slug
                FROM pricing_plans pp
                LEFT JOIN funnel_products fp ON fp.id = pp.product_id
                WHERE ' . implode(' AND ', $where) . ' ORDER BY pp.sort_order, pp.id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['features'] = $r['features_json'] ? json_decode($r['features_json'], true) : [];
        }
        echo json_encode(['data' => $rows]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare('SELECT * FROM pricing_plans WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        $r = $stmt->fetch();
        if (!$r) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        $r['features'] = $r['features_json'] ? json_decode($r['features_json'], true) : [];
        echo json_encode(['data' => $r]);
    }

    public function store(): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $stmt = $this->db->prepare(
            'INSERT INTO pricing_plans (account_id, product_id, slug, name, description, monthly_price, yearly_price, setup_fee, trial_days, features_json, is_featured, is_active, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            currentAccountId(),
            (int)($b['product_id'] ?? 0),
            $b['slug'] ?? '',
            $b['name'] ?? '',
            $b['description'] ?? null,
            $b['monthly_price'] ?? null,
            $b['yearly_price'] ?? null,
            $b['setup_fee'] ?? null,
            $b['trial_days'] ?? 14,
            isset($b['features']) ? json_encode($b['features']) : null,
            $b['is_featured'] ?? 0,
            $b['is_active'] ?? 1,
            $b['sort_order'] ?? 0,
        ]);
        http_response_code(201);
        echo json_encode(['data' => ['id' => (int)$this->db->lastInsertId()]]);
    }

    public function update(string $id): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = []; $params = [];
        foreach (['product_id','slug','name','description','monthly_price','yearly_price','setup_fee','trial_days','is_featured','is_active','sort_order'] as $f) {
            if (array_key_exists($f, $b)) { $fields[] = "$f = ?"; $params[] = $b[$f]; }
        }
        if (array_key_exists('features', $b)) { $fields[] = 'features_json = ?'; $params[] = json_encode($b['features']); }
        if (!$fields) { echo json_encode(['data' => ['updated' => 0]]); return; }
        $params[] = (int)$id; $params[] = currentAccountId();
        $stmt = $this->db->prepare('UPDATE pricing_plans SET ' . implode(', ', $fields) . ' WHERE id = ? AND account_id = ?');
        $stmt->execute($params);
        echo json_encode(['data' => ['updated' => $stmt->rowCount()]]);
    }

    public function destroy(string $id): void {
        $stmt = $this->db->prepare('DELETE FROM pricing_plans WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        echo json_encode(['data' => ['deleted' => $stmt->rowCount()]]);
    }
}
