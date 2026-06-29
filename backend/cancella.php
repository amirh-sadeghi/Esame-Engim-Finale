<?php

require_once 'database.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$database = connectDatabase();

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['id'])) {
    http_response_code(400);
    header('Content-type: application/json');
    echo json_encode(['errore' => 'ID mancante']);
    exit;
}

$id = (int) $input['id'];

$stmt = $database->prepare('DELETE FROM prenotazioni WHERE id = ?');
$stmt->execute([$id]);

if ($stmt->rowCount() === 0) {
    http_response_code(404);
    header('Content-type: application/json');
    echo json_encode(['errore' => 'Prenotazione non trovata']);
    exit;
}

header('Content-type: application/json');
echo json_encode(['status' => 'ok']);
