#!/bin/bash

# setup_database.sh

# Variables
DB_NAME="planner2025"
DB_USER="planner_user"
DB_PASSWORD="securepassword"

# Exportar la contraseña para psql
export PGPASSWORD=$DB_PASSWORD

# Crear la base de datos si no existe
psql -h localhost -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || psql -h localhost -U $DB_USER -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# Crear la tabla tasks
psql -h localhost -U $DB_USER -d $DB_NAME -f setup_database.sql

echo "Base de datos y tabla 'tasks' configuradas correctamente."
