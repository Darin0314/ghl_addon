<?php

class Blog_postsController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $where = ['account_id = ?']; $params = [currentAccountId()];
        if (isset($_GET['is_published'])) { $where[] = 'is_published = ?'; $params[] = (int)$_GET['is_published']; }
        $stmt = $this->db->prepare('SELECT id, slug, title, excerpt, target_keyword, funnel_stage, persona_id, product_id, published_at, views, conversions, is_published, updated_at
                                    FROM blog_posts WHERE ' . implode(' AND ', $where) . ' ORDER BY COALESCE(published_at, updated_at) DESC');
        $stmt->execute($params);
        echo json_encode(['data' => $stmt->fetchAll()]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare('SELECT * FROM blog_posts WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        $r = $stmt->fetch();
        if (!$r) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        echo json_encode(['data' => $r]);
    }

    public function store(): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $stmt = $this->db->prepare(
            'INSERT INTO blog_posts (account_id, calendar_id, slug, title, excerpt, body_md, hero_image_url, target_keyword, meta_title, meta_description, persona_id, product_id, funnel_stage, published_at, is_published)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            currentAccountId(),
            $b['calendar_id'] ?? null, $b['slug'] ?? '', $b['title'] ?? '',
            $b['excerpt'] ?? null, $b['body_md'] ?? null,
            $b['hero_image_url'] ?? null, $b['target_keyword'] ?? null,
            $b['meta_title'] ?? null, $b['meta_description'] ?? null,
            $b['persona_id'] ?? null, $b['product_id'] ?? null,
            $b['funnel_stage'] ?? 'top',
            ($b['is_published'] ?? 0) ? ($b['published_at'] ?? date('Y-m-d H:i:s')) : null,
            $b['is_published'] ?? 0,
        ]);
        http_response_code(201);
        echo json_encode(['data' => ['id' => (int)$this->db->lastInsertId()]]);
    }

    public function update(string $id): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = []; $params = [];
        foreach (['slug','title','excerpt','body_md','hero_image_url','target_keyword','meta_title','meta_description','persona_id','product_id','funnel_stage','is_published'] as $f) {
            if (array_key_exists($f, $b)) { $fields[] = "$f = ?"; $params[] = $b[$f]; }
        }
        if (array_key_exists('is_published', $b) && (int)$b['is_published'] === 1 && !array_key_exists('published_at', $b)) {
            $fields[] = 'published_at = COALESCE(published_at, NOW())';
        }
        if (!$fields) { echo json_encode(['data' => ['updated' => 0]]); return; }
        $params[] = (int)$id; $params[] = currentAccountId();
        $stmt = $this->db->prepare('UPDATE blog_posts SET ' . implode(', ', $fields) . ' WHERE id = ? AND account_id = ?');
        $stmt->execute($params);
        echo json_encode(['data' => ['updated' => $stmt->rowCount()]]);
    }

    public function destroy(string $id): void {
        $stmt = $this->db->prepare('DELETE FROM blog_posts WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        echo json_encode(['data' => ['deleted' => $stmt->rowCount()]]);
    }
}
