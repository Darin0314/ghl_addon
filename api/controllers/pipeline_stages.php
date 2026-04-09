<?php

class Pipeline_stagesController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $stmt = $this->db->query('SELECT ps.*, p.name AS pipeline_name FROM pipeline_stages ps JOIN pipelines p ON p.id = ps.pipeline_id ORDER BY ps.pipeline_id, ps.sort_order');
        echo json_encode(['data' => $stmt->fetchAll()]);
    }

    public function show(string $id): void { echo json_encode(['data' => []]); }
    public function store(): void          { echo json_encode(['data' => []]); }
    public function update(string $id): void { echo json_encode(['data' => []]); }
    public function destroy(string $id): void { echo json_encode(['data' => []]); }
}
