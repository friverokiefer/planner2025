
# Planner2025 (Beta)

Planner2025 es una plataforma de planificación de tareas diseñada para facilitar la gestión personal y colaborativa. Este proyecto está actualmente en fase beta, por lo que algunas funcionalidades están en desarrollo o en revisión. Agradecemos tus sugerencias y reportes de errores para mejorar la versión final.

---

## Tabla de Contenidos

* [Características](https://chatgpt.com/c/67981de9-797c-800a-addb-64fe1344a589#caracter%C3%ADsticas)
* [Requisitos Previos](https://chatgpt.com/c/67981de9-797c-800a-addb-64fe1344a589#requisitos-previos)
* [Configuración del Proyecto](https://chatgpt.com/c/67981de9-797c-800a-addb-64fe1344a589#configuraci%C3%B3n-del-proyecto)
* [Ejecución del Proyecto](https://chatgpt.com/c/67981de9-797c-800a-addb-64fe1344a589#ejecuci%C3%B3n-del-proyecto)
* [Estructura del Proyecto](https://chatgpt.com/c/67981de9-797c-800a-addb-64fe1344a589#estructura-del-proyecto)
* [Notas Adicionales](https://chatgpt.com/c/67981de9-797c-800a-addb-64fe1344a589#notas-adicionales)
* [Contribuciones](https://chatgpt.com/c/67981de9-797c-800a-addb-64fe1344a589#contribuciones)

---

## Características

* **Gestión de Tareas** : Crea, edita, elimina, completa y archiva tareas.
* **Control de Tiempo** : Temporizador integrado para medir el tiempo trabajado en cada tarea.
* **Amigos y Colaboradores** : Enviar, aceptar o rechazar solicitudes de amistad para colaborar en tareas.
* **Interfaz Intuitiva** : Diseño optimizado para facilitar la experiencia del usuario.
* **Gestión de Prioridades y Dificultades** : Clasifica tareas según prioridad y nivel de dificultad.

> **Nota:** Esta es una versión beta. La versión final incluirá optimizaciones, nuevas funcionalidades y un mejor rendimiento.

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener lo siguiente instalado en tu sistema:

1. **Node.js** (versión 16 o superior)
2. **npm** o **yarn**
3. **PostgreSQL** (base de datos utilizada en el backend)
4. **Git**

Además, es necesario clonar este repositorio e instalar las dependencias.

---

## Configuración del Proyecto

1. **Clona este repositorio:**
   ```bash
   git clone https://github.com/tuusuario/Planner2025.git
   cd Planner2025
   ```
2. **Configura el backend:**
   * Ve a la carpeta del backend:
     ```bash
     cd backend
     ```
   * Crea un archivo `.env` basado en el ejemplo proporcionado (`.env.example`). Configura las siguientes variables:
     ```env
     DB_HOST=localhost
     DB_PORT=5432
     DB_USER=tu_usuario
     DB_PASSWORD=tu_contraseña
     DB_NAME=nombre_de_tu_base_de_datos
     JWT_SECRET=clave_secreta_para_jwt
     ```
   * Instala las dependencias del backend:
     ```bash
     npm install
     ```
   * Ejecuta las migraciones para configurar la base de datos:
     ```bash
     npm run migrate
     ```
3. **Configura el frontend:**
   * Ve a la carpeta del frontend:
     ```bash
     cd ../frontend
     ```
   * Instala las dependencias del frontend:
     ```bash
     npm install
     ```

---

## Ejecución del Proyecto

1. **Inicia el backend:**
   Desde la carpeta `backend`, ejecuta:

   ```bash
   npm run dev
   ```

   Esto iniciará el servidor en modo desarrollo. Por defecto, el backend estará disponible en `http://localhost:5000`.
2. **Inicia el frontend:**
   Desde la carpeta `frontend`, ejecuta:

   ```bash
   npm start
   ```

   Esto iniciará la aplicación React. Por defecto, el frontend estará disponible en `http://localhost:3000`.

---

## Estructura del Proyecto

El proyecto está dividido en dos carpetas principales:

```
Planner2025/
├── backend/      # Código del servidor (Node.js + Express)
│   ├── src/      # Controladores, modelos y rutas
│   ├── .env      # Configuración de entorno (excluido en el repositorio)
│   └── package.json
├── frontend/     # Código del cliente (React.js)
│   ├── src/      # Componentes, estilos y servicios
│   └── package.json
└── README.md     # Documentación del proyecto
```

### Archivos Ignorados

El proyecto utiliza un archivo `.gitignore` que excluye lo siguiente:

```
node_modules
backend/.env
backend/node_modules/
frontend/node_modules/
```

---

## Notas Adicionales

* **Fase Beta:** Esta versión es funcional, pero puede contener errores menores. Estamos trabajando para lanzar una versión final optimizada próximamente.
* **PostgreSQL:** Asegúrate de que la base de datos esté correctamente configurada y en ejecución antes de iniciar el servidor.
* **Migraciones:** Si realizas cambios en la estructura de la base de datos, no olvides ejecutar nuevamente las migraciones (`npm run migrate`).

---

## Contribuciones

Las contribuciones son bienvenidas. Si encuentras un error o tienes una sugerencia para mejorar, por favor:

1. Abre un issue en el repositorio.
2. Haz un fork del proyecto.
3. Crea una rama para tu cambio:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
4. Envía un pull request.

Agradecemos cualquier aporte que ayude a mejorar Planner2025.

---

¡Gracias por probar Planner2025! Si tienes dudas, no dudes en contactarnos a través del repositorio. 😊
