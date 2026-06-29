<?php

require_once 'database.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$database = connectDatabase();

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['id'], $input['sala_id'], $input['prenotante'], $input['data'], $input['inizio'], $input['fine'])) {
    http_response_code(400);
    header('Content-type: application/json');
    echo json_encode(['errore' => 'Dati non validi o mancanti']);
    exit;
}

$id      = (int) $input['id'];
$room_id = $input['sala_id'];
$name    = $input['prenotante'];
$date    = $input['data'];
$start   = $input['inizio'];
$end     = $input['fine'];

// Overlap check excluding the booking being edited
$check = $database->prepare('
    SELECT COUNT(*) FROM prenotazioni
    WHERE sala_id = ?
      AND data_prenotazione = ?
      AND ora_inizio < ?
      AND ora_fine   > ?
      AND id != ?
');
$check->execute([$room_id, $date, $end, $start, $id]);

if ((int) $check->fetchColumn() > 0) {
    http_response_code(409);
    header('Content-type: application/json');
    echo json_encode(['errore' => 'La sala è già occupata in questa fascia oraria']);
    exit;
}

$stmt = $database->prepare('
    UPDATE prenotazioni
    SET sala_id = ?, nome_prenotante = ?, data_prenotazione = ?, ora_inizio = ?, ora_fine = ?
    WHERE id = ?
');
$stmt->execute([$room_id, $name, $date, $start, $end, $id]);

if ($stmt->rowCount() === 0) {
    http_response_code(404);
    header('Content-type: application/json');
    echo json_encode(['errore' => 'Prenotazione non trovata']);
    exit;
}

header('Content-type: application/json');
echo json_encode(['status' => 'ok']);
