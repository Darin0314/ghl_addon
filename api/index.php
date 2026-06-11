<?php

require_once __DIR__ . '/middleware/cors.php';
require_once __DIR__ . '/middleware/auth.php';
require_once __DIR__ . '/config/database.php';

applyCors();
header('Content-Type: application/json');
startAuthSession();

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = preg_replace('#^/api#', '', $uri);
$parts  = explode('/', trim($uri, '/'));
$resource = $parts[0] ?? '';
$id       = $parts[1] ?? null;
$action   = $parts[2] ?? null;   // e.g. /api/contacts/bulk/tag

// ─── Auth routes (public) ────────────────────────────────────────────
if ($resource === 'login' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $email = trim($body['email'] ?? '');
    $pass  = $body['password'] ?? '';
    if (!$email || !$pass) { http_response_code(422); echo json_encode(['error' => 'Email + password required']); exit; }
    $db = Database::getConnection();
    $stmt = $db->prepare('SELECT id, name, email, password_hash, role, avatar_url, account_id FROM users WHERE email = ? AND is_active = 1 LIMIT 1');
    $stmt->execute([$email]);
    $u = $stmt->fetch();
    if (!$u || !password_verify($pass, $u['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit;
    }
    $_SESSION['user'] = [
        'id'         => (int)$u['id'],
        'name'       => $u['name'],
        'email'      => $u['email'],
        'role'       => $u['role'],
        'avatar_url' => $u['avatar_url'],
        'account_id' => $u['account_id'] !== null ? (int)$u['account_id'] : 1,
    ];
    echo json_encode(['data' => $_SESSION['user']]);
    exit;
}
if ($resource === 'logout' && $method === 'POST') {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
    echo json_encode(['data' => ['logged_out' => true]]);
    exit;
}
if ($resource === 'me' && $method === 'GET') {
    $u = currentUser();
    if (!$u) { http_response_code(401); echo json_encode(['error' => 'Not signed in']); exit; }
    echo json_encode(['data' => $u]);
    exit;
}
if ($resource === 'health' && $method === 'GET') {
    echo json_encode(['status' => 'ok', 'timestamp' => date('c')]);
    exit;
}

// ─── Public pixel snippet endpoint — landing pages embed this as <script src=…> ──
if ($resource === 'pixel-snippets' && $method === 'GET') {
    $accountId = (int)($_GET['account_id'] ?? 4);
    $db = Database::getConnection();
    $stmt = $db->prepare('SELECT platform, pixel_id, dataset_id, config FROM ad_pixels WHERE account_id = ? AND is_active = 1 AND pixel_id IS NOT NULL');
    $stmt->execute([$accountId]);
    $pixels = $stmt->fetchAll();

    header('Content-Type: application/javascript');
    header('Cache-Control: public, max-age=300');
    echo "// CADsuite Marketing — auto-generated pixel bundle\n";
    echo "(function(){\n";
    echo "window.cadsuiteAccountId = $accountId;\n";
    echo "window.cadsuiteTrack = function(event, value, currency){ try { fetch('/api/track', {method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({event,value,currency,account_id:$accountId,url:location.href,referrer:document.referrer})}); } catch(e){} };\n";

    foreach ($pixels as $p) {
        $pid  = json_encode($p['pixel_id']);
        $dset = json_encode($p['dataset_id']);
        switch ($p['platform']) {
            case 'meta':
                echo "// Meta (Facebook + Instagram)\n";
                echo "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');\n";
                echo "fbq('init', $pid);\nfbq('track', 'PageView');\n";
                break;
            case 'google':
                echo "// Google Ads + GA4 + YouTube Ads (one tag covers all 3)\n";
                echo "(function(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+$pid;document.head.appendChild(s);})();\n";
                echo "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config', $pid);\n";
                break;
            case 'linkedin':
                echo "// LinkedIn Insight Tag\n";
                echo "_linkedin_partner_id = $pid;\nwindow._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);\n";
                echo "(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName('script')[0];var b=document.createElement('script');b.type='text/javascript';b.async=true;b.src='https://snap.licdn.com/li.lms-analytics/insight.min.js';s.parentNode.insertBefore(b,s);})(window.lintrk);\n";
                break;
            case 'tiktok':
                echo "// TikTok Pixel\n";
                echo "!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement('script');o.type='text/javascript',o.async=!0,o.src=i+'?sdkid='+e+'&lib='+t;var a=document.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)};ttq.load($pid);ttq.page();}(window,document,'ttq');\n";
                break;
            case 'x':
                echo "// X (Twitter) Pixel\n";
                echo "!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');\n";
                echo "twq('config',$pid);\n";
                break;
            case 'reddit':
                echo "// Reddit Pixel\n";
                echo "!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement('script');t.src='https://www.redditstatic.com/ads/pixel.js',t.async=!0;var s=d.getElementsByTagName('script')[0];s.parentNode.insertBefore(t,s)}}(window,document);\n";
                echo "rdt('init', $pid);\nrdt('track', 'PageVisit');\n";
                break;
        }
    }
    echo "if (window.cadsuiteTrack) window.cadsuiteTrack('page_view');\n";
    echo "})();\n";
    exit;
}

// ─── Email open pixel — 1x1 GIF, public ────────────────────────────────
if ($resource === 'track-open' && $method === 'GET') {
    $token = $_GET['t'] ?? '';
    if ($token) {
        $db = Database::getConnection();
        $db->prepare('UPDATE campaign_recipients SET status = IF(status = "sent","opened",status), opened_at = COALESCE(opened_at, NOW()) WHERE tracking_token = ?')->execute([$token]);
        $db->prepare('UPDATE campaigns c JOIN campaign_recipients r ON r.campaign_id = c.id SET c.open_count = c.open_count + 1 WHERE r.tracking_token = ? AND r.opened_at IS NULL OR r.opened_at = NOW()')->execute([$token]);
    }
    header('Content-Type: image/gif');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    echo base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    exit;
}

// ─── Email link click tracker — 302s to the real URL ───────────────────
if ($resource === 'track-click' && $method === 'GET') {
    $token = $_GET['t'] ?? '';
    $url   = $_GET['u'] ?? '';
    if ($token && $url) {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT id, campaign_id, account_id FROM campaign_recipients WHERE tracking_token = ?');
        $stmt->execute([$token]);
        if ($r = $stmt->fetch()) {
            $db->prepare('INSERT INTO campaign_link_clicks (recipient_id, campaign_id, account_id, url, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)')->execute([
                $r['id'], $r['campaign_id'], $r['account_id'], $url, $_SERVER['REMOTE_ADDR'] ?? null, substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
            ]);
            $db->prepare('UPDATE campaign_recipients SET status = IF(status IN ("sent","opened"),"clicked",status), clicked_at = COALESCE(clicked_at, NOW()) WHERE id = ?')->execute([$r['id']]);
            $db->prepare('UPDATE campaigns SET click_count = click_count + 1 WHERE id = ?')->execute([$r['campaign_id']]);
        }
    }
    header('Location: ' . $url, true, 302);
    exit;
}

// ─── Unsubscribe — public page ────────────────────────────────────────
if ($resource === 'unsubscribe' && $method === 'GET') {
    $token = $_GET['t'] ?? '';
    header('Content-Type: text/html; charset=UTF-8');
    if (!$token) { echo '<p>Missing token.</p>'; exit; }
    $db = Database::getConnection();
    $stmt = $db->prepare('SELECT email, account_id FROM campaign_recipients WHERE tracking_token = ?');
    $stmt->execute([$token]);
    $r = $stmt->fetch();
    if (!$r) { echo '<p>Invalid token.</p>'; exit; }
    $db->prepare('INSERT IGNORE INTO unsubscribes (account_id, email) VALUES (?, ?)')->execute([$r['account_id'], strtolower($r['email'])]);
    $db->prepare('UPDATE campaign_recipients SET status = "unsubscribed", unsubscribed_at = NOW() WHERE tracking_token = ?')->execute([$token]);
    echo '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;text-align:center;padding:80px;color:#222;"><h2>Unsubscribed</h2><p>You won&rsquo;t receive any more marketing emails from CADsuite at <strong>' . htmlspecialchars($r['email']) . '</strong>.</p><p>Changed your mind? <a href="https://marketing.cadsuite.com/resubscribe">Resubscribe</a>.</p></body></html>';
    exit;
}

// ─── Public CSV exports — contacts download for CADsuite ──────────────
if ($resource === 'contacts-csv' && $method === 'GET') {
    $accountId = (int)($_GET['account_id'] ?? 4);
    $db = Database::getConnection();
    $stmt = $db->prepare('SELECT id, name, email, phone, source, notes, created_at FROM contacts WHERE account_id = ? ORDER BY id');
    $stmt->execute([$accountId]);
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="cadsuite_contacts.csv"');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['id','name','email','phone','source','notes','created_at']);
    foreach ($stmt as $row) fputcsv($out, $row);
    exit;
}

// ─── Public Calendly-style booking endpoints ──────────────────────────
if ($resource === 'book' && $id && $method === 'GET') {
    // GET /api/book/{event_type_slug}/availability?date=YYYY-MM-DD
    $db = Database::getConnection();
    $stmt = $db->prepare('SELECT * FROM event_types WHERE slug = ? AND is_active = 1 LIMIT 1');
    $stmt->execute([$id]);
    $et = $stmt->fetch();
    if (!$et) { http_response_code(404); echo json_encode(['error' => 'Event type not found']); exit; }

    if (($_GET['action'] ?? '') === 'availability') {
        $date = $_GET['date'] ?? date('Y-m-d');
        $dt = DateTime::createFromFormat('Y-m-d', $date);
        if (!$dt) { http_response_code(422); echo json_encode(['error' => 'invalid date']); exit; }
        $dow = (int)$dt->format('N'); // 1=Mon … 7=Sun
        $stmt = $db->prepare('SELECT start_time, end_time, timezone FROM availability_blocks WHERE account_id = ? AND day_of_week = ? AND is_active = 1');
        $stmt->execute([$et['account_id'], $dow]);
        $blocks = $stmt->fetchAll();

        // Existing bookings for that day
        $stmt = $db->prepare('SELECT starts_at, ends_at FROM appointments WHERE account_id = ? AND DATE(starts_at) = ? AND status IN ("booked","rescheduled")');
        $stmt->execute([$et['account_id'], $date]);
        $taken = array_map(function ($r) {
            return [strtotime($r['starts_at']), strtotime($r['ends_at'])];
        }, $stmt->fetchAll());

        $duration = (int)$et['duration_minutes'];
        $slots = [];
        foreach ($blocks as $b) {
            $start = strtotime("$date {$b['start_time']}");
            $end   = strtotime("$date {$b['end_time']}");
            for ($t = $start; $t + $duration*60 <= $end; $t += $duration*60) {
                $clash = false;
                foreach ($taken as [$bs, $be]) {
                    if ($t < $be && $t + $duration*60 > $bs) { $clash = true; break; }
                }
                if (!$clash && $t > time() + (int)$et['min_notice_hours'] * 3600) {
                    $slots[] = date('c', $t);
                }
            }
        }
        echo json_encode(['data' => ['event_type' => $et, 'date' => $date, 'slots' => $slots]]);
        exit;
    }

    $et['questions'] = $et['questions_json'] ? json_decode($et['questions_json'], true) : [];
    echo json_encode(['data' => $et]);
    exit;
}

if ($resource === 'book' && $id && $method === 'POST') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $db = Database::getConnection();
    $stmt = $db->prepare('SELECT * FROM event_types WHERE slug = ? AND is_active = 1 LIMIT 1');
    $stmt->execute([$id]);
    $et = $stmt->fetch();
    if (!$et) { http_response_code(404); echo json_encode(['error' => 'Event type not found']); exit; }
    if (empty($b['starts_at']) || empty($b['invitee_email'])) {
        http_response_code(422); echo json_encode(['error' => 'starts_at + invitee_email required']); exit;
    }
    $startTs = strtotime($b['starts_at']);
    $endTs = $startTs + (int)$et['duration_minutes'] * 60;
    $token = bin2hex(random_bytes(16));

    $stmt = $db->prepare(
        'INSERT INTO appointments (account_id, event_type_id, invitee_name, invitee_email, invitee_phone, starts_at, ends_at, timezone, location_type, answers_json, cancel_token, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "booked")'
    );
    $stmt->execute([
        $et['account_id'], $et['id'],
        $b['invitee_name'] ?? null, $b['invitee_email'], $b['invitee_phone'] ?? null,
        date('Y-m-d H:i:s', $startTs), date('Y-m-d H:i:s', $endTs),
        $b['timezone'] ?? 'America/Denver',
        $et['location_type'],
        isset($b['answers']) ? json_encode($b['answers']) : null,
        $token,
    ]);
    $apptId = $db->lastInsertId();

    // Auto-create or update contact
    $db->prepare('INSERT INTO contacts (account_id, name, email, phone, source, tags, persona_id, created_at)
                  VALUES (?, ?, ?, ?, "calendar_booking", JSON_ARRAY("demo-booked"), NULL, NOW())
                  ON DUPLICATE KEY UPDATE name = COALESCE(name, VALUES(name)), phone = COALESCE(phone, VALUES(phone))')
       ->execute([$et['account_id'], $b['invitee_name'] ?? null, $b['invitee_email'], $b['invitee_phone'] ?? null]);

    echo json_encode(['data' => ['id' => (int)$apptId, 'cancel_token' => $token, 'starts_at' => date('c', $startTs)]]);
    exit;
}

// ─── Public form-submission endpoint for funnel pages ──────────────────
if ($resource === 'submit' && $method === 'POST') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $accountId = (int)($b['account_id'] ?? 4);
    $pageId = (int)($b['page_id'] ?? 0);
    $email = trim($b['email'] ?? '');
    $name  = trim($b['name'] ?? '');
    $phone = trim($b['phone'] ?? '');
    if (!$email && !$name && !$phone) { http_response_code(422); echo json_encode(['error' => 'one of email/name/phone required']); exit; }

    $db = Database::getConnection();
    $db->prepare('INSERT INTO form_submissions (account_id, funnel_page_id, email, name, phone, data_json, ip, user_agent)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
       ->execute([
        $accountId, $pageId ?: null, $email, $name, $phone,
        json_encode($b['data'] ?? []),
        $_SERVER['REMOTE_ADDR'] ?? null,
        substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
       ]);
    if ($email) {
        $db->prepare('INSERT INTO contacts (account_id, name, email, phone, source, tags, created_at)
                      VALUES (?, ?, ?, ?, "funnel_form", JSON_ARRAY("lead"), NOW())
                      ON DUPLICATE KEY UPDATE name = COALESCE(name, VALUES(name)), phone = COALESCE(phone, VALUES(phone))')
           ->execute([$accountId, $name ?: $email, $email, $phone ?: null]);
    }
    if ($pageId) $db->prepare('UPDATE funnel_pages SET conversions = conversions + 1 WHERE id = ?')->execute([$pageId]);
    echo json_encode(['data' => ['ok' => true]]);
    exit;
}

// ─── Public event tracker — landing pages POST conversion events here ───
if ($resource === 'track' && $method === 'POST') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $accountId = (int)($b['account_id'] ?? 4);
    $event = trim($b['event'] ?? '');
    if (!$event) { http_response_code(422); echo json_encode(['error' => 'event required']); exit; }
    $db = Database::getConnection();

    // Log the funnel event
    $stmt = $db->prepare('INSERT INTO funnel_events (account_id, event_type, event_value, source, utm_source, utm_medium, utm_campaign, referrer, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $accountId, $event,
        $b['value'] ?? null,
        $b['source'] ?? null,
        $b['utm_source'] ?? null, $b['utm_medium'] ?? null, $b['utm_campaign'] ?? null,
        $b['referrer'] ?? null,
        json_encode($b),
    ]);

    // Server-side Conversion API fire (best-effort, async, never blocks)
    $stmt = $db->prepare('SELECT ap.platform, ap.pixel_id, ap.dataset_id, ap.conversion_api_token, m.* FROM ad_pixels ap
                          LEFT JOIN pixel_event_mappings m ON m.account_id = ap.account_id AND m.funnel_event = ?
                          WHERE ap.account_id = ? AND ap.is_active = 1 AND ap.conversion_api_token IS NOT NULL');
    $stmt->execute([$event, $accountId]);
    foreach ($stmt->fetchAll() as $pixel) {
        $platform = $pixel['platform'];
        $stmt2 = $db->prepare('INSERT INTO pixel_events (account_id, platform, event_name, event_value, dispatch_mode, status, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt2->execute([$accountId, $platform, $event, $b['value'] ?? null, 'server', 'queued', json_encode($b)]);
        // Real CAPI dispatch happens in a cron worker; row marked 'queued' here.
    }

    echo json_encode(['ok' => true]);
    exit;
}

// ─── Gmail OAuth callback is public (Google redirects here, no session) ────
if ($resource === 'gmail' && $id === 'callback' && $method === 'GET') {
    require_once __DIR__ . '/controllers/gmail.php';
    $g = new GmailIntegration(Database::getConnection());
    $code   = $_GET['code']  ?? '';
    $state  = $_GET['state'] ?? '';
    $expectedState = $_SESSION['gmail_oauth_state'] ?? null;
    $userId        = $_SESSION['gmail_oauth_user']  ?? null;
    unset($_SESSION['gmail_oauth_state'], $_SESSION['gmail_oauth_user']);
    if (!$code || !$state || $state !== $expectedState || !$userId) {
        header('Content-Type: text/html');
        echo '<script>window.opener?.postMessage({type:"gmail-oauth",ok:false,error:"State mismatch"},"*");window.close();</script>';
        exit;
    }
    try {
        $redirectUri = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . '/api/gmail/callback';
        $g->exchangeCode($code, $redirectUri, (int)$userId);
        header('Content-Type: text/html');
        echo '<script>window.opener?.postMessage({type:"gmail-oauth",ok:true},"*");window.close();</script>';
    } catch (\Throwable $e) {
        header('Content-Type: text/html');
        echo '<script>window.opener?.postMessage({type:"gmail-oauth",ok:false,error:' . json_encode($e->getMessage()) . '},"*");window.close();</script>';
    }
    exit;
}

// ─── LinkedIn OAuth callback is public (LinkedIn redirects here, no session) ────
if ($resource === 'linkedin' && $id === 'callback' && $method === 'GET') {
    require_once __DIR__ . '/controllers/linkedin.php';
    $li = new LinkedInIntegration(Database::getConnection());
    $code  = $_GET['code']  ?? '';
    $state = $_GET['state'] ?? '';
    $expectedState = $_SESSION['linkedin_oauth_state'] ?? null;
    unset($_SESSION['linkedin_oauth_state']);
    if (!$code || !$state || $state !== $expectedState) {
        header('Content-Type: text/html');
        echo '<script>window.opener?.postMessage({type:"linkedin-oauth",ok:false,error:"State mismatch"},"*");window.close();</script>';
        exit;
    }
    try {
        $redirectUri = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . '/api/linkedin/callback';
        $li->exchangeCode($code, $redirectUri);
        header('Content-Type: text/html');
        echo '<script>window.opener?.postMessage({type:"linkedin-oauth",ok:true},"*");window.close();</script>';
    } catch (\Throwable $e) {
        header('Content-Type: text/html');
        echo '<script>window.opener?.postMessage({type:"linkedin-oauth",ok:false,error:' . json_encode($e->getMessage()) . '},"*");window.close();</script>';
    }
    exit;
}

// ─── Everything below requires auth ────────────────────────────────
$CURRENT_USER = requireAuth();

// ─── Gmail integration (authed) ────────────────────────────────────
if ($resource === 'gmail') {
    require_once __DIR__ . '/controllers/gmail.php';
    $g  = new GmailIntegration(Database::getConnection());
    $me = $CURRENT_USER;
    if ($id === 'status' && $method === 'GET') {
        echo json_encode(['data' => $g->statusForUser((int)$me['id'])]);
        exit;
    }
    if ($id === 'client' && $method === 'POST') {
        if (($me['role'] ?? '') !== 'admin') { http_response_code(403); echo json_encode(['error' => 'Admin only']); exit; }
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $g->saveClient(trim($body['client_id'] ?? ''), trim($body['client_secret'] ?? ''));
        echo json_encode(['data' => $g->statusForUser((int)$me['id'])]);
        exit;
    }
    if ($id === 'auth-url' && $method === 'GET') {
        $redirectUri = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . '/api/gmail/callback';
        $url = $g->buildAuthUrl((int)$me['id'], $redirectUri);
        if (!$url) { http_response_code(400); echo json_encode(['error' => 'Gmail OAuth client not configured — admin must paste Client ID + Secret first']); exit; }
        echo json_encode(['data' => ['url' => $url]]);
        exit;
    }
    if ($id === 'disconnect' && $method === 'POST') {
        $g->disconnect((int)$me['id']);
        echo json_encode(['data' => ['disconnected' => true]]);
        exit;
    }
    if ($id === 'send' && $method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        try {
            $res = $g->send(
                (int)$me['id'],
                trim($body['to_email'] ?? ''),
                trim($body['to_name']  ?? ''),
                trim($body['subject']  ?? ''),
                (string)($body['body'] ?? ''),
                !empty($body['contact_id']) ? (int)$body['contact_id'] : null,
            );
            echo json_encode(['data' => $res]);
        } catch (\Throwable $e) { http_response_code(500); echo json_encode(['error' => $e->getMessage()]); }
        exit;
    }
    http_response_code(404); echo json_encode(['error' => 'Unknown gmail route']); exit;
}

// ─── LinkedIn integration (authed) ─────────────────────────────────
if ($resource === 'linkedin') {
    require_once __DIR__ . '/controllers/linkedin.php';
    $li = new LinkedInIntegration(Database::getConnection());
    if ($id === 'status' && $method === 'GET') { echo json_encode(['data' => $li->status()]); exit; }
    if ($id === 'credentials' && $method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $li->save([
            'client_id'     => trim($body['client_id']     ?? ''),
            'client_secret' => trim($body['client_secret'] ?? ''),
            'organization_urn' => trim($body['organization_urn'] ?? ''),
        ]);
        echo json_encode(['data' => $li->status()]);
        exit;
    }
    if ($id === 'auth-url' && $method === 'GET') {
        $redirectUri = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . '/api/linkedin/callback';
        $url = $li->buildAuthUrl($redirectUri);
        if (!$url) { http_response_code(400); echo json_encode(['error' => 'Credentials not configured — paste Client ID + Secret first']); exit; }
        echo json_encode(['data' => ['url' => $url]]);
        exit;
    }
    if ($id === 'disconnect' && $method === 'POST') {
        $li->save(['access_token' => null, 'refresh_token' => null, 'token_expires_at' => null]);
        echo json_encode(['data' => ['disconnected' => true]]);
        exit;
    }
    if ($id === 'sync' && $method === 'POST') {
        try { echo json_encode(['data' => $li->sync()]); }
        catch (\Throwable $e) { http_response_code(500); echo json_encode(['error' => $e->getMessage()]); }
        exit;
    }
    if ($id === 'settings' && $method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $li->save([
            'agent_distribution' => $body['agent_distribution'] ?? null,
            'field_map'          => $body['field_map'] ?? null,
            'sync_enabled'       => isset($body['sync_enabled']) ? (int)!!$body['sync_enabled'] : 1,
        ]);
        echo json_encode(['data' => $li->status()]);
        exit;
    }
    http_response_code(404); echo json_encode(['error' => 'Unknown linkedin route']); exit;
}

// CSV import + auto-distribute. Frontend parses the CSV in-browser and posts
// the rows array plus a distribution config; we batch-insert and round-robin
// (or equal-split / single-assignee) the assigned_to column.
//   POST /api/contacts/import
//     { rows: [{name, email, phone, source, notes, tags?}, ...],
//       agent_ids: [1,2,3,4], strategy: 'round_robin'|'equal'|'one',
//       skip_duplicates: true }
if ($resource === 'contacts' && $id === 'import' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $rows = is_array($body['rows'] ?? null) ? $body['rows'] : [];
    if (!$rows) { echo json_encode(['data' => ['created' => 0, 'skipped' => 0, 'assigned' => []]]); exit; }
    $agentIds       = array_values(array_filter(array_map('intval', $body['agent_ids'] ?? []), fn($v) => $v > 0));
    $strategy       = $body['strategy'] ?? 'round_robin';
    $skipDuplicates = !empty($body['skip_duplicates']);

    $db = Database::getConnection();

    // Pre-load existing phone digits if de-dupe requested.
    $existingDigits = [];
    if ($skipDuplicates) {
        foreach ($db->query("SELECT REGEXP_REPLACE(COALESCE(phone,''),'[^0-9]','') AS d FROM contacts")->fetchAll() as $r) {
            if ($r['d'] !== '') $existingDigits[$r['d']] = true;
        }
    }

    // Build assignment plan up-front so it's deterministic + we can return it.
    $plan = [];
    if ($agentIds) {
        $n = count($rows);
        $a = count($agentIds);
        if ($strategy === 'one') {
            $plan = array_fill(0, $n, $agentIds[0]);
        } elseif ($strategy === 'equal') {
            // Split as evenly as possible; remainder goes to the earlier agents.
            $base  = intdiv($n, $a);
            $extra = $n % $a;
            $i = 0;
            foreach ($agentIds as $idx => $agent) {
                $count = $base + ($idx < $extra ? 1 : 0);
                for ($k = 0; $k < $count; $k++) $plan[$i++] = $agent;
            }
        } else { // round_robin (default)
            for ($i = 0; $i < $n; $i++) $plan[$i] = $agentIds[$i % $a];
        }
    }

    $insert = $db->prepare(
        'INSERT INTO contacts (name, email, phone, source, tags, notes, assigned_to)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    $created = 0; $skipped = 0;
    $assignedCount = [];
    foreach ($rows as $i => $row) {
        $name = trim($row['name'] ?? '');
        if ($name === '') { $skipped++; continue; }
        $phone = trim($row['phone'] ?? '');
        if ($skipDuplicates && $phone !== '') {
            $digits = preg_replace('/\D+/', '', $phone);
            if ($digits !== '' && isset($existingDigits[$digits])) { $skipped++; continue; }
            if ($digits !== '') $existingDigits[$digits] = true;
        }
        $tags = $row['tags'] ?? null;
        if (is_array($tags)) $tags = json_encode($tags);
        elseif (is_string($tags) && $tags !== '') {
            $parts = array_values(array_filter(array_map('trim', explode(';', $tags))));
            $tags = $parts ? json_encode($parts) : null;
        } else $tags = null;

        $assignedTo = $plan[$i] ?? null;
        $insert->execute([
            $name,
            $row['email']  ?: null,
            $phone         ?: null,
            $row['source'] ?? null,
            $tags,
            $row['notes']  ?? null,
            $assignedTo,
        ]);
        $created++;
        if ($assignedTo) $assignedCount[$assignedTo] = ($assignedCount[$assignedTo] ?? 0) + 1;
    }
    echo json_encode(['data' => [
        'created'  => $created,
        'skipped'  => $skipped,
        'assigned' => $assignedCount,
    ]]);
    exit;
}

// Bulk actions
if ($resource === 'contacts' && $id === 'bulk' && $method === 'POST') {
    require_once __DIR__ . '/controllers/contacts.php';
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $ids  = array_map('intval', $body['ids'] ?? []);
    if (empty($ids)) { echo json_encode(['data' => []]); exit; }

    $db = Database::getConnection();
    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    switch ($action) {
        case 'delete':
            $db->prepare("DELETE FROM contacts WHERE id IN ($placeholders)")->execute($ids);
            break;
        case 'tag':
            $tag = $body['tag'] ?? '';
            if ($tag) {
                $stmt = $db->prepare("SELECT id, tags FROM contacts WHERE id IN ($placeholders)");
                $stmt->execute($ids);
                $upd = $db->prepare('UPDATE contacts SET tags = ? WHERE id = ?');
                foreach ($stmt->fetchAll() as $row) {
                    $tags = $row['tags'] ? json_decode($row['tags'], true) : [];
                    if (!in_array($tag, $tags)) $tags[] = $tag;
                    $upd->execute([json_encode($tags), $row['id']]);
                }
            }
            break;
        case 'stage':
            $stageId = (int)($body['pipeline_stage_id'] ?? 0);
            $db->prepare("UPDATE contacts SET pipeline_stage_id = ? WHERE id IN ($placeholders)")
               ->execute(array_merge([$stageId], $ids));
            break;
    }
    echo json_encode(['data' => ['updated' => count($ids)]]);
    exit;
}

// Handle hyphenated resource names (pipeline_stages → pipeline_stages.php)
$controllerFile = __DIR__ . "/controllers/{$resource}.php";
if ($resource && file_exists($controllerFile)) {
    require_once $controllerFile;
    // Build class name: pipeline_stages → Pipeline_stagesController
    $class = ucfirst($resource) . 'Controller';
    if (class_exists($class)) {
        $controller = new $class(Database::getConnection());
        match ($method) {
            'GET'    => $id ? $controller->show($id) : $controller->index(),
            'POST'   => $controller->store(),
            'PUT'    => $controller->update($id),
            'DELETE' => $controller->destroy($id),
            default  => http_response_code(405),
        };
        exit;
    }
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
