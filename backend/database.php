<?php

function connectDatabase()
{
    $host     = 'localhost';
    $database = 'sale_riunioni';
    $username = 'tecnicoweb@localhost';
    $password = 'tsw-2026';

    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $host, $database);
    return new PDO($dsn, $username, $password);
}
