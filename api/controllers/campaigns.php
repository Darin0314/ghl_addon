<?php

class CampaignsController {
    public function __construct(private PDO $db) {}

    public function index(): void {
        $stmt = $this->db->prepare(
            'SELECT id, name, subject, status, recipient_count, sent_count, open_count, click_count, scheduled_at, sent_at, updated_at
             FROM campaigns WHERE account_id = ? ORDER BY updated_at DESC'
        );
        $stmt->execute([currentAccountId()]);
        echo json_encode(['data' => $stmt->fetchAll()]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare('SELECT * FROM campaigns WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        $r = $stmt->fetch();
        if (!$r) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
        $r['blocks'] = $r['blocks_json'] ? json_decode($r['blocks_json'], true) : [];
        $r['recipient_filter'] = $r['recipient_filter'] ? json_decode($r['recipient_filter'], true) : null;
        echo json_encode(['data' => $r]);
    }

    public function store(): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $stmt = $this->db->prepare(
            'INSERT INTO campaigns (account_id, name, subject, preview_text, from_name, from_email, reply_to, body_html, blocks_json, recipient_filter, status, scheduled_at, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            currentAccountId(),
            $b['name'] ?? 'Untitled campaign',
            $b['subject'] ?? '',
            $b['preview_text'] ?? null,
            $b['from_name'] ?? null, $b['from_email'] ?? null, $b['reply_to'] ?? null,
            $b['body_html'] ?? null,
            isset($b['blocks']) ? json_encode($b['blocks']) : null,
            isset($b['recipient_filter']) ? json_encode($b['recipient_filter']) : null,
            $b['status'] ?? 'draft',
            $b['scheduled_at'] ?? null,
            (int)(currentUser()['id'] ?? 0),
        ]);
        http_response_code(201);
        echo json_encode(['data' => ['id' => (int)$this->db->lastInsertId()]]);
    }

    public function update(string $id): void {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        if (isset($_GET['action'])) { $this->handleAction($id, $_GET['action'], $b); return; }
        $fields = []; $params = [];
        foreach (['name','subject','preview_text','from_name','from_email','reply_to','body_html','status','scheduled_at'] as $f) {
            if (array_key_exists($f, $b)) { $fields[] = "$f = ?"; $params[] = $b[$f]; }
        }
        if (array_key_exists('blocks', $b)) { $fields[] = 'blocks_json = ?'; $params[] = json_encode($b['blocks']); }
        if (array_key_exists('recipient_filter', $b)) { $fields[] = 'recipient_filter = ?'; $params[] = json_encode($b['recipient_filter']); }
        if (!$fields) { echo json_encode(['data' => ['updated' => 0]]); return; }
        $params[] = (int)$id; $params[] = currentAccountId();
        $stmt = $this->db->prepare('UPDATE campaigns SET ' . implode(', ', $fields) . ' WHERE id = ? AND account_id = ?');
        $stmt->execute($params);
        echo json_encode(['data' => ['updated' => $stmt->rowCount()]]);
    }

    public function destroy(string $id): void {
        $stmt = $this->db->prepare('DELETE FROM campaigns WHERE id = ? AND account_id = ?');
        $stmt->execute([(int)$id, currentAccountId()]);
        echo json_encode(['data' => ['deleted' => $stmt->rowCount()]]);
    }

    private function handleAction(string $id, string $action, array $body): void {
        $cid = (int)$id;
        $stmt = $this->db->prepare('SELECT * FROM campaigns WHERE id = ? AND account_id = ?');
        $stmt->execute([$cid, currentAccountId()]);
        $campaign = $stmt->fetch();
        if (!$campaign) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }

        switch ($action) {
            case 'recipients':
                $contacts = $this->resolveRecipients($body['recipient_filter'] ?? json_decode($campaign['recipient_filter'] ?? 'null', true) ?? []);
                $insert = $this->db->prepare('INSERT IGNORE INTO campaign_recipients (campaign_id, account_id, contact_id, email, name, tracking_token) VALUES (?, ?, ?, ?, ?, ?)');
                $count = 0;
                foreach ($contacts as $c) {
                    if (empty($c['email'])) continue;
                    $insert->execute([$cid, currentAccountId(), $c['id'] ?? null, $c['email'], $c['name'] ?? null, bin2hex(random_bytes(16))]);
                    $count++;
                }
                $this->db->prepare('UPDATE campaigns SET recipient_count = ? WHERE id = ?')->execute([$count, $cid]);
                echo json_encode(['data' => ['queued' => $count]]);
                return;

            case 'send_test':
                $to = trim($body['to'] ?? '');
                if (!filter_var($to, FILTER_VALIDATE_EMAIL)) { http_response_code(422); echo json_encode(['error' => 'valid recipient email required']); return; }
                $sent = $this->sendEmail($campaign, $to, $body['name'] ?? 'Test recipient', 'TEST-' . bin2hex(random_bytes(8)), true);
                echo json_encode(['data' => ['sent' => $sent]]);
                return;

            case 'send':
                $this->db->prepare('UPDATE campaigns SET status = "sending" WHERE id = ?')->execute([$cid]);
                $stmt = $this->db->prepare('SELECT * FROM campaign_recipients WHERE campaign_id = ? AND status = "queued" LIMIT 250');
                $stmt->execute([$cid]);
                $batch = $stmt->fetchAll();
                $okCount = 0; $failCount = 0;
                foreach ($batch as $r) {
                    if ($this->checkUnsubscribed($r['email'])) {
                        $this->db->prepare('UPDATE campaign_recipients SET status = "unsubscribed", unsubscribed_at = NOW() WHERE id = ?')->execute([$r['id']]);
                        continue;
                    }
                    $ok = $this->sendEmail($campaign, $r['email'], $r['name'], $r['tracking_token'], false);
                    if ($ok) {
                        $this->db->prepare('UPDATE campaign_recipients SET status = "sent", sent_at = NOW() WHERE id = ?')->execute([$r['id']]);
                        $okCount++;
                    } else {
                        $this->db->prepare('UPDATE campaign_recipients SET status = "failed", failure_reason = "mail() returned false" WHERE id = ?')->execute([$r['id']]);
                        $failCount++;
                    }
                }
                $stmt = $this->db->prepare('SELECT COUNT(*) c FROM campaign_recipients WHERE campaign_id = ? AND status = "queued"');
                $stmt->execute([$cid]);
                $remaining = (int)$stmt->fetch()['c'];
                if ($remaining === 0) {
                    $this->db->prepare('UPDATE campaigns SET status = "sent", sent_at = NOW(), sent_count = sent_count + ? WHERE id = ?')->execute([$okCount, $cid]);
                } else {
                    $this->db->prepare('UPDATE campaigns SET sent_count = sent_count + ? WHERE id = ?')->execute([$okCount, $cid]);
                }
                echo json_encode(['data' => ['sent' => $okCount, 'failed' => $failCount, 'remaining' => $remaining]]);
                return;
        }
        http_response_code(400);
        echo json_encode(['error' => 'unknown action']);
    }

    private function resolveRecipients(array $filter): array {
        $where = ['account_id = ?']; $params = [currentAccountId()];
        if (!empty($filter['persona_id'])) { $where[] = 'persona_id = ?'; $params[] = (int)$filter['persona_id']; }
        if (!empty($filter['tag'])) { $where[] = 'JSON_CONTAINS(tags, ?)'; $params[] = json_encode($filter['tag']); }
        if (!empty($filter['source'])) { $where[] = 'source = ?'; $params[] = $filter['source']; }
        if (!empty($filter['contact_ids'])) {
            $ids = array_map('intval', $filter['contact_ids']);
            if ($ids) {
                $placeholders = implode(',', array_fill(0, count($ids), '?'));
                $where[] = 'id IN (' . $placeholders . ')';
                $params = array_merge($params, $ids);
            }
        }
        $where[] = "email IS NOT NULL AND email != ''";
        $sql = 'SELECT id, name, email FROM contacts WHERE ' . implode(' AND ', $where);
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    private function checkUnsubscribed(string $email): bool {
        $stmt = $this->db->prepare('SELECT 1 FROM unsubscribes WHERE account_id = ? AND email = ?');
        $stmt->execute([currentAccountId(), strtolower($email)]);
        return (bool)$stmt->fetchColumn();
    }

    private function sendEmail(array $campaign, string $toEmail, ?string $toName, string $token, bool $isTest): bool {
        $stmt = $this->db->prepare('SELECT * FROM smtp_settings WHERE account_id = ?');
        $stmt->execute([currentAccountId()]);
        $smtp = $stmt->fetch();
        $from = $campaign['from_email'] ?: ($smtp['from_email'] ?? 'noreply@cadsuite.com');
        $fromName = $campaign['from_name'] ?: ($smtp['from_name'] ?? 'CADsuite');
        $subject = $isTest ? '[TEST] ' . $campaign['subject'] : $campaign['subject'];

        $html = $this->renderHtml($campaign, $toName, $token);
        $textFallback = strip_tags(preg_replace('/<br\s*\/?>/', "\n", $html));

        $boundary = '=_' . bin2hex(random_bytes(16));
        $headers  = "From: " . sprintf('"%s" <%s>', $fromName, $from) . "\r\n";
        if ($campaign['reply_to']) $headers .= "Reply-To: " . $campaign['reply_to'] . "\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";
        $headers .= "List-Unsubscribe: <" . $this->unsubscribeUrl($token) . ">\r\n";
        $headers .= "X-Tracking-Token: $token\r\n";

        $body  = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n$textFallback\r\n";
        $body .= "--$boundary\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n$html\r\n";
        $body .= "--$boundary--\r\n";

        return @mail($toEmail, $subject, $body, $headers);
    }

    private function renderHtml(array $campaign, ?string $toName, string $token): string {
        $html = $campaign['body_html'] ?: '';
        if (!$html && $campaign['blocks_json']) {
            $blocks = json_decode($campaign['blocks_json'], true) ?: [];
            $html = $this->blocksToHtml($blocks);
        }
        $html = str_replace(['{first_name}', '{email}'], [$toName ?? 'there', ''], $html);

        // Rewrite links for click tracking
        $base = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'marketing.cadsuite.com');
        $html = preg_replace_callback('/href="(https?:\/\/[^"]+)"/i', function ($m) use ($base, $token) {
            return 'href="' . $base . '/api/track-click?t=' . urlencode($token) . '&u=' . urlencode($m[1]) . '"';
        }, $html);

        // Tracking pixel + footer
        $html .= '<img src="' . $base . '/api/track-open?t=' . urlencode($token) . '" width="1" height="1" style="display:none" alt="" />';
        $html .= '<div style="margin-top:30px;padding:20px;color:#999;font-size:11px;text-align:center;border-top:1px solid #eee;">';
        $html .= 'You received this because you subscribed at CADsuite. <a href="' . $this->unsubscribeUrl($token) . '">Unsubscribe</a>';
        $html .= '</div>';
        return '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#222;max-width:600px;margin:0 auto;padding:20px;">' . $html . '</body></html>';
    }

    private function unsubscribeUrl(string $token): string {
        $base = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'marketing.cadsuite.com');
        return $base . '/api/unsubscribe?t=' . urlencode($token);
    }

    private function blocksToHtml(array $blocks): string {
        $out = '';
        foreach ($blocks as $b) {
            switch ($b['type'] ?? '') {
                case 'heading':
                    $size = $b['size'] ?? 'h2';
                    $out .= '<' . $size . ' style="color:#111;margin:18px 0 10px;">' . htmlspecialchars($b['text'] ?? '') . '</' . $size . '>';
                    break;
                case 'text':
                    $out .= '<p style="line-height:1.6;margin:10px 0;">' . nl2br(htmlspecialchars($b['text'] ?? '')) . '</p>';
                    break;
                case 'image':
                    $alt = htmlspecialchars($b['alt'] ?? '');
                    $out .= '<p style="text-align:center;"><img src="' . htmlspecialchars($b['url'] ?? '') . '" alt="' . $alt . '" style="max-width:100%;height:auto;border-radius:6px;" /></p>';
                    break;
                case 'button':
                    $url = htmlspecialchars($b['url'] ?? '#');
                    $label = htmlspecialchars($b['label'] ?? 'Click');
                    $out .= '<p style="text-align:center;margin:20px 0;"><a href="' . $url . '" style="background:#4f46e5;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">' . $label . '</a></p>';
                    break;
                case 'divider':
                    $out .= '<hr style="border:none;border-top:1px solid #ddd;margin:24px 0;" />';
                    break;
                case 'spacer':
                    $out .= '<div style="height:' . (int)($b['height'] ?? 24) . 'px;"></div>';
                    break;
            }
        }
        return $out;
    }
}
