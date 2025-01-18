-- setup_database.sql

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  priority VARCHAR(50),
  difficulty INT CHECK (difficulty >= 1 AND difficulty <= 3),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
