<?php

/**
 * Poll LinkedIn Lead Gen Forms for new responses and drop them into contacts.
 * Run via cron every 5-10 minutes once the LinkedIn Marketing Developer
 * app is approved and tokens are connected.
 *
 *   *\/5 * * * * /usr/bin/php /home/cadsuite/public_html/production/marketing/cron/linkedin_pull.php
 */
require_once __DIR__ . '/../api/config/database.php';
require_once __DIR__ . '/../api/controllers/linkedin.php';

$db = Database::getConnection();
$li = new LinkedInIntegration($db);

$status = $li->status();
if (!$status['connected']) {
    fwrite(STDERR, "[" . date('c') . "] LinkedIn not connected — skipping\n");
    exit(0);
}
if (!$status['sync_enabled']) {
    fwrite(STDERR, "[" . date('c') . "] LinkedIn sync disabled — skipping\n");
    exit(0);
}

try {
    $result = $li->sync();
    fwrite(STDOUT, "[" . date('c') . "] LinkedIn sync ok: imported {$result['imported']} lead(s)\n");
} catch (\Throwable $e) {
    fwrite(STDERR, "[" . date('c') . "] LinkedIn sync FAILED: " . $e->getMessage() . "\n");
    exit(1);
}
