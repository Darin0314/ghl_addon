<?php

function applyCors(): void {
    $allowed = getenv('FRONTEND_URL') ?: 'http://localhost:5175';
    header("Access-Control-Allow-Origin: $allowed");
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}
