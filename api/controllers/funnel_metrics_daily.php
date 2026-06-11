<?php

class Funnel_metrics_dailyController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $where = ['account_id = ?']; $params = [currentAccountId()];
        $from = $_GET['from'] ?? date('Y-m-d', strtotime('-30 days'));
        $to   = $_GET['to']   ?? date('Y-m-d');
        $where[] = 'metric_date BETWEEN ? AND ?';
        $params[] = $from; $params[] = $to;
        if (!empty($_GET['product_id'])) { $where[] = 'product_id = ?'; $params[] = (int)$_GET['product_id']; }
        $stmt = $this->db->prepare(
            'SELECT metric_date,
              SUM(visitors) visitors,
              SUM(leads) leads,
              SUM(mqls) mqls,
              SUM(sqls) sqls,
              SUM(trials) trials,
              SUM(paid_conversions) paid_conversions,
              SUM(mrr_added) mrr_added,
              SUM(churned) churned,
              SUM(churned_mrr) churned_mrr,
              SUM(ad_spend) ad_spend
            FROM funnel_metrics_daily WHERE ' . implode(' AND ', $where) . ' GROUP BY metric_date ORDER BY metric_date ASC'
        );
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        // Derive funnel-wide totals + the headline KPIs
        $totals = ['visitors'=>0,'leads'=>0,'mqls'=>0,'sqls'=>0,'trials'=>0,'paid_conversions'=>0,'mrr_added'=>0,'churned'=>0,'churned_mrr'=>0,'ad_spend'=>0];
        foreach ($rows as $r) foreach ($totals as $k=>$_) $totals[$k] += (float)$r[$k];
        $totals['cac'] = $totals['paid_conversions'] > 0 ? round($totals['ad_spend'] / $totals['paid_conversions'], 2) : null;
        $totals['visit_to_lead_pct']  = $totals['visitors'] ? round(100.0 * $totals['leads']  / $totals['visitors'], 1) : 0;
        $totals['lead_to_trial_pct']  = $totals['leads']    ? round(100.0 * $totals['trials'] / $totals['leads'], 1)    : 0;
        $totals['trial_to_paid_pct']  = $totals['trials']   ? round(100.0 * $totals['paid_conversions'] / $totals['trials'], 1) : 0;

        echo json_encode(['data' => ['series' => $rows, 'totals' => $totals, 'from' => $from, 'to' => $to]]);
    }

    public function show(string $id): void { $this->index(); }
    public function store(): void   { http_response_code(405); echo json_encode(['error' => 'read-only']); }
    public function update(string $id): void { http_response_code(405); echo json_encode(['error' => 'read-only']); }
    public function destroy(string $id): void { http_response_code(405); echo json_encode(['error' => 'read-only']); }
}
