<?php

/**
 * Gmail OAuth + send-as integration for the marketing CRM.
 *
 * Per-user: each rep connects their own Google account. The CRM uses
 * that user's refresh token to send emails out through Gmail (recipient
 * sees it from the rep's actual address, not a system relay).
 *
 *   POST   /api/gmail/client          — admin: paste Client ID/Secret once
 *   GET    /api/gmail/status          — current user's connection state
 *   GET    /api/gmail/auth-url        — start OAuth (per-user)
 *   GET    /api/gmail/callback        — OAuth redirect (public, popup→postMessage)
 *   POST   /api/gmail/disconnect      — current user disconnects
 *   POST   /api/gmail/send            — send an email through Gmail API
 *
 * Lighter than the full appraisers GmailService (no inbox sync, threads,
 * label management) — just the bits needed for outbound from the CRM.
 * Inbox sync can be layered on later if the team wants reply tracking.
 */
class GmailIntegration {
    private const AUTH_URL  = 'https://accounts.google.com/o/oauth2/v2/auth';
    private const TOKEN_URL = 'https://oauth2.googleapis.com/token';
    private const SEND_URL  = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
    private const SCOPES    = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email openid';

    public function __construct(private PDO $db) {}

    public function getClient(): array {
        $row = $this->db->query('SELECT client_id, client_secret FROM gmail_oauth_client WHERE id = 1')->fetch();
        return $row ?: ['client_id' => null, 'client_secret' => null];
    }

    public function saveClient(string $clientId, string $clientSecret): void {
        $this->db->prepare('UPDATE gmail_oauth_client SET client_id = ?, client_secret = ? WHERE id = 1')
                 ->execute([$clientId, $clientSecret]);
    }

    public function statusForUser(int $userId): array {
        $client = $this->getClient();
        $stmt = $this->db->prepare('SELECT email_address, token_expires_at, connected_at FROM gmail_token WHERE user_id = ?');
        $stmt->execute([$userId]);
        $tok = $stmt->fetch();
        return [
            'configured'   => !empty($client['client_id']) && !empty($client['client_secret']),
            'connected'    => !empty($tok),
            'email_address'    => $tok['email_address']    ?? null,
            'token_expires_at' => $tok['token_expires_at'] ?? null,
            'connected_at'     => $tok['connected_at']     ?? null,
        ];
    }

    public function buildAuthUrl(int $userId, string $redirectUri): ?string {
        $client = $this->getClient();
        if (empty($client['client_id'])) return null;
        $state = bin2hex(random_bytes(16));
        $_SESSION['gmail_oauth_state'] = $state;
        $_SESSION['gmail_oauth_user']  = $userId;
        return self::AUTH_URL . '?' . http_build_query([
            'response_type' => 'code',
            'client_id'     => $client['client_id'],
            'redirect_uri'  => $redirectUri,
            'state'         => $state,
            'scope'         => self::SCOPES,
            'access_type'   => 'offline',
            'prompt'        => 'consent',  // force refresh_token issuance
        ]);
    }

    public function exchangeCode(string $code, string $redirectUri, int $userId): void {
        $client = $this->getClient();
        if (empty($client['client_id']) || empty($client['client_secret'])) {
            throw new RuntimeException('Gmail OAuth client not configured');
        }
        $ch = curl_init(self::TOKEN_URL);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POSTFIELDS => http_build_query([
                'grant_type'    => 'authorization_code',
                'code'          => $code,
                'redirect_uri'  => $redirectUri,
                'client_id'     => $client['client_id'],
                'client_secret' => $client['client_secret'],
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
        if (empty($json['refresh_token'])) {
            // Happens on re-consent — keep any existing refresh_token rather than nulling it.
            $existing = $this->db->prepare('SELECT refresh_token FROM gmail_token WHERE user_id = ?');
            $existing->execute([$userId]);
            $rt = $existing->fetch();
            $json['refresh_token'] = $rt['refresh_token'] ?? null;
        }
        if (empty($json['refresh_token'])) {
            throw new RuntimeException('No refresh token from Google — revoke access in Google Account and reconnect');
        }
        $expires = date('Y-m-d H:i:s', time() + (int)($json['expires_in'] ?? 3600));
        $email   = $this->fetchEmailAddress($json['access_token']);

        $this->db->prepare(
            'INSERT INTO gmail_token (user_id, email_address, access_token, refresh_token, token_expires_at)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE email_address = VALUES(email_address),
                                     access_token  = VALUES(access_token),
                                     refresh_token = VALUES(refresh_token),
                                     token_expires_at = VALUES(token_expires_at)'
        )->execute([$userId, $email, $json['access_token'], $json['refresh_token'], $expires]);
    }

    public function disconnect(int $userId): void {
        $this->db->prepare('DELETE FROM gmail_token WHERE user_id = ?')->execute([$userId]);
    }

    public function send(int $userId, string $toEmail, string $toName, string $subject, string $bodyText, ?int $contactId = null): array {
        $access = $this->getValidAccessToken($userId);
        if (!$access) throw new RuntimeException('Gmail not connected for this user');

        // Build RFC 822 message — Gmail API wants a base64url-encoded blob.
        $from = $access['email_address'] ?: '';
        $to   = $toName ? "$toName <$toEmail>" : $toEmail;
        $raw  = "From: $from\r\nTo: $to\r\nSubject: " . $this->encodeHeader($subject)
              . "\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n"
              . $bodyText;
        $encoded = rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');

        $ch = curl_init(self::SEND_URL);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POSTFIELDS => json_encode(['raw' => $encoded]),
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $access['access_token'],
                'Content-Type: application/json',
            ],
            CURLOPT_TIMEOUT => 30,
        ]);
        $resp = curl_exec($ch);
        $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($http >= 300) {
            $err = json_decode($resp ?: '{}', true);
            throw new RuntimeException('Gmail send failed: ' . ($err['error']['message'] ?? $resp));
        }
        $json = json_decode($resp ?: '{}', true);
        $msgId = $json['id'] ?? null;

        // Log to sent_emails for the contact timeline
        $this->db->prepare(
            'INSERT INTO sent_emails (user_id, contact_id, gmail_msg_id, to_email, to_name, subject, body_text)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        )->execute([$userId, $contactId, $msgId, $toEmail, $toName, $subject, $bodyText]);
        return ['id' => $msgId, 'from' => $from];
    }

    private function getValidAccessToken(int $userId): ?array {
        $stmt = $this->db->prepare('SELECT * FROM gmail_token WHERE user_id = ?');
        $stmt->execute([$userId]);
        $tok = $stmt->fetch();
        if (!$tok) return null;
        // Refresh if expiring within 60s
        if (strtotime($tok['token_expires_at']) - time() > 60) return $tok;
        $client = $this->getClient();
        if (!$client['client_id']) return null;

        $ch = curl_init(self::TOKEN_URL);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POSTFIELDS => http_build_query([
                'grant_type'    => 'refresh_token',
                'refresh_token' => $tok['refresh_token'],
                'client_id'     => $client['client_id'],
                'client_secret' => $client['client_secret'],
            ]),
            CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
            CURLOPT_TIMEOUT => 30,
        ]);
        $body = curl_exec($ch);
        $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $json = json_decode($body ?: '{}', true);
        if ($http !== 200 || empty($json['access_token'])) return null;
        $expires = date('Y-m-d H:i:s', time() + (int)($json['expires_in'] ?? 3600));
        $this->db->prepare('UPDATE gmail_token SET access_token = ?, token_expires_at = ? WHERE user_id = ?')
                 ->execute([$json['access_token'], $expires, $userId]);
        $tok['access_token']     = $json['access_token'];
        $tok['token_expires_at'] = $expires;
        return $tok;
    }

    private function fetchEmailAddress(string $accessToken): ?string {
        $ch = curl_init('https://openidconnect.googleapis.com/v1/userinfo');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $accessToken],
            CURLOPT_TIMEOUT => 15,
        ]);
        $body = curl_exec($ch); curl_close($ch);
        $json = json_decode($body ?: '{}', true);
        return $json['email'] ?? null;
    }

    private function encodeHeader(string $s): string {
        return '=?UTF-8?B?' . base64_encode($s) . '?=';
    }
}
