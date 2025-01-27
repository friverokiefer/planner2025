-- setup_database.sql

-- 1. Tabla "user"
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profile_picture BYTEA,
    bio TEXT,
    skillset TEXT[]  -- Representa una lista de habilidades
);

-- 2. Tabla task
CREATE TABLE IF NOT EXISTS task (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    state TEXT,
    difficulty TEXT,
    deadline DATE,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL
);

-- 3. Tabla time_track
CREATE TABLE IF NOT EXISTS time_track (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- 4. Tabla friendship
CREATE TABLE IF NOT EXISTS friendship (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status TEXT,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES "user"(id) ON DELETE CASCADE,
    UNIQUE (user_id, friend_id)  -- Evita duplicados de amistades
);

-- 5. Tabla comment
CREATE TABLE IF NOT EXISTS comment (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT,
    FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- 6. Tabla task_assignment
CREATE TABLE IF NOT EXISTS task_assignment (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    UNIQUE (task_id, user_id)  -- Evita asignaciones duplicadas
);

-- 7. Tabla notification
CREATE TABLE IF NOT EXISTS notification (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    user_id INT NOT NULL,
    notification_type TEXT,
    message TEXT,
    task_id INT,
    read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE SET NULL
);

-- 8. Tabla rating
CREATE TABLE IF NOT EXISTS rating (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),  -- Asumiendo una escala de 1 a 5
    FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    UNIQUE (task_id, user_id)  -- Evita múltiples calificaciones por usuario y tarea
);

-- 9. Tabla tag
CREATE TABLE IF NOT EXISTS tag (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    name TEXT UNIQUE NOT NULL
);

-- 10. Tabla task_tag
CREATE TABLE IF NOT EXISTS task_tag (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    task_id INT NOT NULL,
    tag_id INT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE,
    UNIQUE (task_id, tag_id)  -- Evita duplicados de etiquetas en una tarea
);
