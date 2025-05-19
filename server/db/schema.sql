DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,      
    password        VARCHAR(100) NOT NULL,            
    method          TEXT NOT NULL,                   
    encryption_key  TEXT                            
);
