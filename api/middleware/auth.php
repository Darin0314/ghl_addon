<?php

/**
 * Auth middleware — session cookie based. Login POSTs email + password,
 * we verify the bcrypt hash, then stash {id, name, role} in $_SESSION.
 * requireAuth() runs at the top of index.php for every protected route
 * and bails to 401 if no user is in the session.
 *
 * Role-based scoping (the actual security bit) is done inside each
 * controller — `agent` role auto-restricts list queries to its own
 * assigned_to. Frontend hiding alone isn't enough; this enforces it
 * server-side even if someone hand-edits the URL.
 */

function startAuthSession(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_name('GHL_SESSION');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure'   => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    ]);
    session_start();
}

function currentUser(): ?array {
    startAuthSession();
    return $_SESSION['user'] ?? null;
}

function requireAuth(): array {
    $u = currentUser();
    if (!$u) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }
    return $u;
}

function currentAccountId(): int {
    $u = currentUser();
    return (int)($u['account_id'] ?? 1);
}

function isAgent(?array $user = null): bool {
    $u = $user ?? currentUser();
    return ($u['role'] ?? null) === 'agent';
}

function isManager(?array $user = null): bool {
    $u = $user ?? currentUser();
    return in_array(($u['role'] ?? null), ['admin', 'manager'], true);
}

/**
 * Routes that bypass requireAuth(). Login + logout + health.
 */
function isPublicRoute(string $resource, ?string $id, string $method): bool {
    if ($resource === 'login'   && $method === 'POST') return true;
    if ($resource === 'logout'  && $method === 'POST') return true;
    if ($resource === 'health'  && $method === 'GET')  return true;
    return false;
}
