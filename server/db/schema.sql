DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users
(
    id            serial         PRIMARY KEY,
    username      varchar(20)    NOT NULL UNIQUE,
    password      varchar(100)   NOT NULL,
    method        text           NOT NULL,
    encryption_key text
);
