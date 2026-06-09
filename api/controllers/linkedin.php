<?php

/**
 * LinkedIn Lead Gen Ads integration controller.
 *
 * NOT a standard resource controller — index.php has bespoke routes for it
 * because the OAuth callback flow and the sync trigger don't fit
 * REST-CRUD. This file just exposes a couple of helper methods.
 *
 *   GET    /api/linkedin/status            — current connection + last sync
 *   POST   /api/linkedin/credentials       — paste client_id + client_secret
 *   GET    /api/linkedin/auth-url          — returns OAuth URL for the popup
 *   GET    /api/linkedin/callback          — OAuth redirect target
 *   POST   /api/linkedin/disconnect        — clears tokens
 *   POST   /api/linkedin/sync              — manual lead pull
 *   POST   /api/linkedin/settings          — agent distribution + field map
 *
 * LinkedIn API surface needed (once an approved Marketing Developer app is in
 * place): Lead Sync API + Form Sync API. Scopes: `r_marketing_leadgen_automation`,
 * `r_organization_social`, `rw_organization_admin`. Approval queue is real —
 * 1-3 weeks at LinkedIn's side. This skeleton holds all the wiring so when
 * the credentials arrive the only thing missing is paste + click Connect.
 */
class LinkedInIntegration {
    private const TOKEN_URL  = 'https://www.linkedin.com/oauth/v2/accessToken';
    private const AUTH_URL   = 'https://www.linkedin.com/oauth/v2/authorization';
    private const LEAD_URL   = 'https://api.linkedin.com/rest/leadFormResponses';
    private const SCOPES     = 'r_marketing_leadgen_automation r_organization_social rw_organization_admin';
    private const API_VERSION = '202405'; // LinkedIn requires versioned headers

    public function __construct(private PDO $db) {}

    public function load(): array {
        $stmt = $this->db->query('SELECT * FROM linkedin_integration WHERE id = 1');
        return $stmt->fetch() ?: [];
    }

    public function save(array $fields): void {
        // Whitelist of columns the API can set.
        $allowed = ['client_id','client_secret','access_token','refresh_token',
                    'token_expires_at','organization_urn','last_sync_at',
                    'last_sync_count','last_sync_error','agent_distribution',
                    'field_map','sync_enabled'];
        $sets = []; $params = [];
        foreach ($allowed as $k) {
            if (array_key_exists($k, $fields)) {
                $sets[] = "$k = ?";
                $val = $fields[$k];
                if (in_array($k, ['agent_distribution','field_map'], true) && !is_string($val)) {
                    $val = $val === null ? null : json_encode($val);
                }
                $params[] = $val;
            }
        }
        if (!$sets) return;
        $params[] = 1;
        $this->db->prepare('UPDATE linkedin_integration SET ' . implode(', ', $sets) . ' WHERE id = ?')
                 ->execute($params);
    }

    public function status(): array {
        $row = $this->load();
        return [
            'configured'      => !empty($row['client_id']) && !empty($row['client_secret']),
            'connected'       => !empty($row['access_token']),
            'organization_urn'=> $row['organization_urn'] ?? null,
            'last_sync_at'    => $row['last_sync_at'] ?? null,
            'last_sync_count' => (int)($row['last_sync_count'] ?? 0),
            'last_sync_error' => $row['last_sync_error'] ?? null,
            'token_expires_at'=> $row['token_expires_at'] ?? null,
            'sync_enabled'    => (int)($row['sync_enabled'] ?? 1),
            'agent_distribution' => $row['agent_distribution'] ? json_decode($row['agent_distribution'], true) : null,
            'field_map'       => $row['field_map']        ? json_decode($row['field_map'], true)        : null,
        ];
    }

    public function buildAuthUrl(string $redirectUri): ?string {
        $row = $this->load();
        if (empty($row['client_id'])) return null;
        $state = bin2hex(random_bytes(16));
        $_SESSION['linkedin_oauth_state'] = $state;
        return self::AUTH_URL . '?' . http_build_query([
            'response_type' => 'code',
            'client_id'     => $row['client_id'],
            'redirect_uri'  => $redirectUri,
            'state'         => $state,
            'scope'         => self::SCOPES,
        ]);
    }

    public function exchangeCode(string $code, string $redirectUri): array {
        $row = $this->load();
        if (empty($row['client_id']) || empty($row['client_secret'])) {
            throw new RuntimeException('LinkedIn credentials not configured');
        }
        $ch = curl_init(self::TOKEN_URL);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POSTFIELDS => http_build_query([
                'grant_type'    => 'authorization_code',
                'code'          => $code,
                'redirect_uri'  => $redirectUri,
                'client_id'     => $row['client_id'],
                'client_secret' => $row['client_secret'],
            ]),
            CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
            CURLOPT_TIMEOUT => 30,
        ]);
        $body = curl_exec($ch);
        $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $json = json_decode($body ?: '{}', true);
        if ($http !== 200 || empty($json['access_token'])) {
            throw new RuntimeException('Token exchange failed: ' . ($json['error_description'] ?? $body));
        }
        $expires = isset($json['expires_in']) ? date('Y-m-d H:i:s', time() + (int)$json['expires_in']) : null;
        $this->save([
            'access_token'     => $json['access_token'],
            'refresh_token'    => $json['refresh_token'] ?? null,
            'token_expires_at' => $expires,
        ]);
        return $json;
    }

    /**
     * Manual / cron-triggered lead pull. Pulls forms responses for the
     * connected organization, drops any not-yet-imported lead into contacts,
     * auto-distributes per the saved agent_distribution config.
     *
     * NOTE: This method is the part that requires an approved Marketing
     * Developer app to actually return data. With unapproved tokens it
     * returns 403. The flow + DB plumbing all work — just the API call
     * is gated on LinkedIn's manual review.
     */
    public function sync(): array {
        $row = $this->load();
        if (empty($row['access_token'])) throw new RuntimeException('Not connected');
        if (empty($row['organization_urn'])) throw new RuntimeException('Organization URN missing');

        // Refresh token if expiring within 5 min
        if ($row['refresh_token'] && $row['token_expires_at']
            && strtotime($row['token_expires_at']) - time() < 300) {
            $this->refreshAccessToken($row);
            $row = $this->load();
        }

        $ch = curl_init(self::LEAD_URL . '?q=owner&owner=' . urlencode($row['organization_urn']) . '&count=50');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $row['access_token'],
                'LinkedIn-Version: ' . self::API_VERSION,
                'X-Restli-Protocol-Version: 2.0.0',
            ],
            CURLOPT_TIMEOUT => 60,
        ]);
        $body = curl_exec($ch);
        $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($http !== 200) {
            $msg = 'LinkedIn API HTTP ' . $http;
            $this->save(['last_sync_error' => $msg . ': ' . substr($body, 0, 500)]);
            throw new RuntimeException($msg);
        }
        $json = json_decode($body ?: '{}', true);
        $imported = $this->ingestResponses($json['elements'] ?? [], $row);
        $this->save([
            'last_sync_at'    => date('Y-m-d H:i:s'),
            'last_sync_count' => $imported,
            'last_sync_error' => null,
        ]);
        return ['imported' => $imported];
    }

    private function refreshAccessToken(array $row): void {
        $ch = curl_init(self::TOKEN_URL);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POSTFIELDS => http_build_query([
                'grant_type'    => 'refresh_token',
                'refresh_token' => $row['refresh_token'],
                'client_id'     => $row['client_id'],
                'client_secret' => $row['client_secret'],
            ]),
            CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
            CURLOPT_TIMEOUT => 30,
        ]);
        $body = curl_exec($ch);
        $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $json = json_decode($body ?: '{}', true);
        if ($http !== 200 || empty($json['access_token'])) return;
        $expires = isset($json['expires_in']) ? date('Y-m-d H:i:s', time() + (int)$json['expires_in']) : null;
        $this->save([
            'access_token'     => $json['access_token'],
            'refresh_token'    => $json['refresh_token'] ?? $row['refresh_token'],
            'token_expires_at' => $expires,
        ]);
    }

    private function ingestResponses(array $elements, array $row): int {
        if (!$elements) return 0;
        $fieldMap = $row['field_map'] ? json_decode($row['field_map'], true) : [];
        $dist     = $row['agent_distribution'] ? json_decode($row['agent_distribution'], true) : ['agent_ids' => [], 'strategy' => 'round_robin'];
        $agents   = is_array($dist['agent_ids'] ?? null) ? array_values(array_filter(array_map('intval', $dist['agent_ids']))) : [];
        $strategy = $dist['strategy'] ?? 'round_robin';

        $seen = $this->db->prepare('SELECT lead_id FROM linkedin_leads_imported WHERE lead_id = ?');
        $insertContact = $this->db->prepare(
            'INSERT INTO contacts (name, email, phone, source, notes, assigned_to)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $insertSeen = $this->db->prepare(
            'INSERT INTO linkedin_leads_imported (lead_id, form_id, contact_id, raw_payload) VALUES (?, ?, ?, ?)'
        );

        $imported = 0;
        $i = 0;
        foreach ($elements as $el) {
            $leadId = (string)($el['id'] ?? '');
            if ($leadId === '') continue;
            $seen->execute([$leadId]); if ($seen->fetch()) continue;

            // Flatten LinkedIn's leadDataValues array into a name=>value map
            $kv = [];
            foreach ($el['leadDataValues'] ?? [] as $v) {
                $name = $v['name'] ?? $v['questionId'] ?? '';
                if ($name) $kv[$name] = $v['value'] ?? '';
            }
            // Apply field_map if configured, else best-effort default
            $name  = $this->pickField($kv, $fieldMap, ['name','full_name','fullName','first_name'], '');
            if ($name === '' && (isset($kv['first_name']) || isset($kv['last_name']))) {
                $name = trim(($kv['first_name'] ?? '') . ' ' . ($kv['last_name'] ?? ''));
            }
            if ($name === '') $name = 'LinkedIn Lead';
            $email = $this->pickField($kv, $fieldMap, ['email','email_address'], null);
            $phone = $this->pickField($kv, $fieldMap, ['phone','phone_number','mobile'], null);
            $notes = "Imported from LinkedIn Lead Gen form (lead_id={$leadId})";

            $assignedTo = null;
            if ($agents) {
                if ($strategy === 'one')      $assignedTo = $agents[0];
                elseif ($strategy === 'equal'){ $assignedTo = $agents[$i % count($agents)]; }
                else                          { $assignedTo = $agents[$i % count($agents)]; }
            }

            $insertContact->execute([$name, $email, $phone, 'LinkedIn', $notes, $assignedTo]);
            $cid = (int)$this->db->lastInsertId();
            $insertSeen->execute([$leadId, $el['leadForm'] ?? null, $cid, json_encode($el)]);
            $imported++; $i++;
        }
        return $imported;
    }

    private function pickField(array $kv, array $map, array $candidates, $default) {
        foreach ($map as $linkedinField => $contactCol) {
            if (in_array($contactCol, $candidates, true) && isset($kv[$linkedinField]) && $kv[$linkedinField] !== '') {
                return $kv[$linkedinField];
            }
        }
        foreach ($candidates as $c) if (isset($kv[$c]) && $kv[$c] !== '') return $kv[$c];
        return $default;
    }
}
