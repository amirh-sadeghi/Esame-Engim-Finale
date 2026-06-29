<?php

require_once 'database.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$database = connectDatabase();

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['sala_id'], $input['prenotante'], $input['data'], $input['inizio'], $input['fine'])) {
    http_response_code(400);
    header("Content-type: application/json");
    echo json_encode(['errore' => 'Dati non validi o mancanti']);
    exit;
}

$room_id = $input['sala_id'];
$name    = $input['prenotante'];
$date    = $input['data'];
$start   = $input['inizio'];
$end     = $input['fine'];

// Server-side overlap check: reject if the room already has a booking that
// overlaps the requested time slot on the same date.
$check = $database->prepare('
    SELECT COUNT(*) FROM prenotazioni
    WHERE sala_id = ?
      AND data_prenotazione = ?
      AND ora_inizio < ?
      AND ora_fine   > ?
');
$check->execute([$room_id, $date, $end, $start]);

if ((int) $check->fetchColumn() > 0) {
    http_response_code(409);
    header("Content-type: application/json");
    echo json_encode(['errore' => 'La sala è già occupata in questa fascia oraria']);
    exit;
}

$statement = $database->prepare('
INSERT INTO prenotazioni (sala_id, nome_prenotante, data_prenotazione, ora_inizio, ora_fine)
VALUES (?, ?, ?, ?, ?)');
$statement->execute([$room_id, $name, $date, $start, $end]);
$new_id = $database->lastInsertId();

header("Content-type: application/json");
echo json_encode([
    'status' => 'ok',
    'id'     => $new_id,
]);
