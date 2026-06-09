<?php

/**
 * Users (agents) endpoints — used by the lead-distribution picker on CSV
 * import and the Pipeline deal "assigned_to" selector. Read-only here;
 * full user CRUD goes into a Settings page later.
 */
class UsersController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $where = ['is_active = 1'];
        $params = [];
        if (!empty($_GET['role'])) {
            $where[]  = 'role = ?';
            $params[] = $_GET['role'];
        }
        $sql = 'SELECT id, name, email, role, avatar_url FROM users';
        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        $sql .= ' ORDER BY name';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['data' => $stmt->fetchAll()]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare('SELECT id, name, email, role, avatar_url FROM users WHERE id = ?');
        $stmt->execute([(int)$id]);
        $row = $stmt->fetch();
        if (!$row) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        echo json_encode(['data' => $row]);
    }

    public function store(): void   { http_response_code(405); echo json_encode(['error' => 'Use settings UI']); }
    public function update(string $id): void { http_response_code(405); echo json_encode(['error' => 'Use settings UI']); }
    public function destroy(string $id): void { http_response_code(405); echo json_encode(['error' => 'Use settings UI']); }
}
