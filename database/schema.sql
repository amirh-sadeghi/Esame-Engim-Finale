CREATE DATABASE IF NOT EXISTS sale_riunioni;
USE sale_riunioni;

DROP TABLE IF EXISTS prenotazioni;
DROP TABLE IF EXISTS sale;

CREATE TABLE sale (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    nome     VARCHAR(100) NOT NULL,
    capienza INT NOT NULL,
    piano    INT NOT NULL
);

CREATE TABLE prenotazioni (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    sala_id           INT NOT NULL,
    nome_prenotante   VARCHAR(100) NOT NULL,
    data_prenotazione DATE NOT NULL,
    ora_inizio        TIME NOT NULL,
    ora_fine          TIME NOT NULL,
    CONSTRAINT fk_prenotazioni_sala
        FOREIGN KEY (sala_id) REFERENCES sale(id)
);


INSERT INTO sale(nome, capienza, piano) VALUES
    ('Sala Blue', 8, 1),
    ('Sala Verde', 15, 2),
    ('Sala Rossa', 4, 1),
    ('Sala Gialla', 20, 3);

INSERT INTO prenotazioni (sala_id, nome_prenotante, data_prenotazione, ora_inizio, ora_fine) VALUES
    (1, 'Mario Rossi', '2025-04-10', '09:00', '10:30'),
    (2, 'Giulia Bianchi', '2025-04-10', '14:00', '15:00'),
    (1, 'Luca Neri ', '2025-04-11', '11:00', '12:00');
    