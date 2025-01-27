#!/bin/bash

# setup_database.sh

# Variables
DB_NAME="planner2025"
DB_USER="planner_user"
DB_PASSWORD="securepassword"

# Exportar la contraseña para psql
export PGPASSWORD=$DB_PASSWORD

# Crear el rol de la base de datos si no existe
psql -h localhost -U postgres -tc "SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER'" | grep -q 1 || psql -h localhost -U postgres -c "CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD';"

# Crear la base de datos si no existe
psql -h localhost -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || psql -h localhost -U $DB_USER -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# Ejecutar el script SQL para crear las tablas
psql -h localhost -U $DB_USER -d $DB_NAME -f setup_database.sql

# Verificar si todas las tablas se crearon correctamente
if [ $? -eq 0 ]; then
    echo "Base de datos '$DB_NAME' y todas las tablas configuradas correctamente."
else
    echo "Ocurrió un error durante la configuración de la base de datos."
fi
