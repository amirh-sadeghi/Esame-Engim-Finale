<?php

require_once 'database.php';

header('Access-Control-Allow-Origin: *');

$database = connectDatabase();
$results  = $database->query('
    SELECT prenotazioni.*, sale.nome AS sala_nome
    FROM prenotazioni
    JOIN sale ON prenotazioni.sala_id = sale.id
');
$rows = $results->fetchAll(PDO::FETCH_ASSOC);

$reservations = [];

foreach ($rows as $row) {
    $reservations[] = [
        'id'         => $row['id'],
        'sala_id'    => $row['sala_id'],
        'sala_nome'  => $row['sala_nome'],
        'prenotante' => $row['nome_prenotante'],
        'data'       => $row['data_prenotazione'],
        'inizio'     => substr($row['ora_inizio'], 0, 5),
        'fine'       => substr($row['ora_fine'], 0, 5),
    ];
}

header("Content-type: application/json; charset=utf-8");
echo json_encode($reservations);
