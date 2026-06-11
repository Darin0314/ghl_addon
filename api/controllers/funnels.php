<?php

class FunnelsController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $stmt = $this->db->prepare(
            'SELECT f.*, (SELECT COUNT(*) FROM funnel_pages WHERE funnel_id = f.id) AS page_count
             FROM funnels f WHERE account_id = ? ORDER BY updated_at DESC'
        );
        $stmt->execute([currentAccountId()]);
        echo json_encode(['data' => $stmt->fetchAll()]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare('SELECT * FROM funnels WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        $f = $stmt->fetch();
        if (!$f) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        $pages = $this->db->prepare('SELECT * FROM funnel_pages WHERE funnel_id = ? ORDER BY step');
        $pages->execute([(int)$id]);
        $f['pages'] = array_map(function ($p) {
            $p['blocks'] = $p['blocks_json'] ? json_decode($p['blocks_json'], true) : [];
            return $p;
        }, $pages->fetchAll());
        echo json_encode(['data' => $f]);
    }

    public function store(): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $stmt = $this->db->prepare(
            'INSERT INTO funnels (account_id, slug, name, description, product_id, persona_id, goal, is_published)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            currentAccountId(),
            $b['slug'] ?? 'untitled-funnel-' . bin2hex(random_bytes(3)),
            $b['name'] ?? 'Untitled funnel',
            $b['description'] ?? null,
            $b['product_id'] ?? null, $b['persona_id'] ?? null,
            $b['goal'] ?? 'lead_capture',
            $b['is_published'] ?? 0,
        ]);
        $id = $this->db->lastInsertId();

        // Seed a single landing page so user has something to edit
        if (empty($b['skip_initial_page'])) {
            $this->db->prepare(
                'INSERT INTO funnel_pages (funnel_id, account_id, slug, step, page_type, title, blocks_json)
                 VALUES (?, ?, ?, 1, ?, ?, ?)'
            )->execute([
                $id, currentAccountId(), 'landing', 'landing',
                $b['name'] ?? 'Untitled landing page',
                json_encode([
                    ['type' => 'heading', 'size' => 'h1', 'text' => 'Your headline here'],
                    ['type' => 'text', 'text' => 'Quick description that explains the offer.'],
                    ['type' => 'form', 'fields' => [
                        ['name' => 'name', 'label' => 'Full name', 'required' => true],
                        ['name' => 'email', 'label' => 'Email', 'required' => true],
                    ], 'submit_label' => 'Get instant access'],
                ]),
            ]);
        }

        http_response_code(201);
        echo json_encode(['data' => ['id' => (int)$id]]);
    }

    public function update(string $id): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = []; $params = [];
        foreach (['name','description','product_id','persona_id','goal','is_published','slug'] as $f) {
            if (array_key_exists($f, $b)) { $fields[] = "$f = ?"; $params[] = $b[$f]; }
        }
        if ($fields) {
            $params[] = (int)$id; $params[] = currentAccountId();
            $stmt = $this->db->prepare('UPDATE funnels SET ' . implode(', ', $fields) . ' WHERE id = ? AND account_id = ?');
            $stmt->execute($params);
        }
        // Pages can be batch-saved via {pages:[...]}
        if (isset($b['pages']) && is_array($b['pages'])) {
            foreach ($b['pages'] as $p) {
                if (isset($p['id'])) {
                    $stmt = $this->db->prepare('UPDATE funnel_pages SET title = ?, page_type = ?, blocks_json = ?, meta_title = ?, meta_description = ? WHERE id = ? AND account_id = ?');
                    $stmt->execute([
                        $p['title'] ?? '', $p['page_type'] ?? 'landing',
                        isset($p['blocks']) ? json_encode($p['blocks']) : null,
                        $p['meta_title'] ?? null, $p['meta_description'] ?? null,
                        (int)$p['id'], currentAccountId(),
                    ]);
                }
            }
        }
        echo json_encode(['data' => ['ok' => true]]);
    }

    public function destroy(string $id): void {
        $stmt = $this->db->prepare('DELETE FROM funnels WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        echo json_encode(['data' => ['deleted' => $stmt->rowCount()]]);
    }
}
