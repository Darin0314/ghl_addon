<?php

class Case_studiesController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $stmt = $this->db->prepare('SELECT cs.*, fp.name AS product_name FROM case_studies cs
                                    LEFT JOIN funnel_products fp ON fp.id = cs.product_id
                                    WHERE cs.account_id = ? ORDER BY cs.created_at DESC');
        $stmt->execute([currentAccountId()]);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['metrics'] = $r['metrics_json'] ? json_decode($r['metrics_json'], true) : null;
        }
        echo json_encode(['data' => $rows]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare('SELECT * FROM case_studies WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        $r = $stmt->fetch();
        if (!$r) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        $r['metrics'] = $r['metrics_json'] ? json_decode($r['metrics_json'], true) : null;
        echo json_encode(['data' => $r]);
    }

    public function store(): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $stmt = $this->db->prepare(
            'INSERT INTO case_studies (account_id, slug, title, customer_name, industry, persona_id, product_id, problem_md, solution_md, results_md, quote, metrics_json, video_url, format, is_published)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            currentAccountId(),
            $b['slug'] ?? '', $b['title'] ?? '', $b['customer_name'] ?? null,
            $b['industry'] ?? null, $b['persona_id'] ?? null, $b['product_id'] ?? null,
            $b['problem_md'] ?? null, $b['solution_md'] ?? null, $b['results_md'] ?? null,
            $b['quote'] ?? null,
            isset($b['metrics']) ? json_encode($b['metrics']) : null,
            $b['video_url'] ?? null, $b['format'] ?? 'written', $b['is_published'] ?? 0,
        ]);
        http_response_code(201);
        echo json_encode(['data' => ['id' => (int)$this->db->lastInsertId()]]);
    }

    public function update(string $id): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = []; $params = [];
        foreach (['slug','title','customer_name','industry','persona_id','product_id','problem_md','solution_md','results_md','quote','video_url','format','is_published'] as $f) {
            if (array_key_exists($f, $b)) { $fields[] = "$f = ?"; $params[] = $b[$f]; }
        }
        if (array_key_exists('metrics', $b)) { $fields[] = 'metrics_json = ?'; $params[] = json_encode($b['metrics']); }
        if (!$fields) { echo json_encode(['data' => ['updated' => 0]]); return; }
        $params[] = (int)$id; $params[] = currentAccountId();
        $stmt = $this->db->prepare('UPDATE case_studies SET ' . implode(', ', $fields) . ' WHERE id = ? AND account_id = ?');
        $stmt->execute($params);
        echo json_encode(['data' => ['updated' => $stmt->rowCount()]]);
    }

    public function destroy(string $id): void {
        $stmt = $this->db->prepare('DELETE FROM case_studies WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        echo json_encode(['data' => ['deleted' => $stmt->rowCount()]]);
    }
}
