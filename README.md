# BusSmart

Este proyecto permite interactuar con mapas, calcular rutas y mostrar información geográfica. La aplicación está construida con un backend en **Node.js + Express** y un frontend moderno y reactivo con **Vue.js**.

---

## Tecnologías Usadas

- **Backend**: Node.js, Express, MongoDB
- **Frontend**: Vue.js 3 (con Vite), JavaScript, Leaflet.js
- **APIs**: OpenRouteService

---

## Configuración del Entorno de Desarrollo

Para trabajar en el proyecto, necesitas tener dos terminales abiertas: una para el backend y otra para el frontend.

### 1. Backend (API y Base de Datos)

Sigue estos pasos para levantar el servidor del backend:

1.  **Abrir una terminal** en la carpeta `backend/`.
    ```bash
    cd backend
    ```
2.  **Instalar dependencias** (solo la primera vez).
    ```bash
    npm install
    ```
3.  **Crear el archivo `.env`** en la raíz de la carpeta `backend/` y configurar las variables de entorno, como tu `API_KEY` de OpenRouteService.
    ```
    API_KEY=tu_api_key_aquí
    MONGO_URI=tu_string_de_conexion_a_mongo
    ```
4.  **Levantar el servidor** del backend.
    ```bash
    npm start
    ```
5.  **Verificar que esté corriendo**. Deberías ver un mensaje en la consola confirmando que el servidor está activo, usualmente en `http://localhost:3000`. **Deja esta terminal corriendo.**

### 2. Frontend (Vue.js con Vite)

Sigue estos pasos para levantar la interfaz de usuario:

1.  **Abrir una segunda terminal** en la carpeta `frontend/`.
    ```bash
    cd frontend
    ```
2.  **Instalar dependencias** (solo la primera vez).
    ```bash
    npm install
    ```
3.  **Levantar el servidor de desarrollo de Vite**.
    ```bash
    npm run dev
    ```
4.  **Abrir la aplicación en el navegador**. La terminal te mostrará una URL local (normalmente `http://localhost:5173/`). Abre ese enlace en tu navegador para ver y trabajar en la aplicación.

#### ¿Qué es el Servidor de Vite?

A diferencia de los archivos HTML estáticos, un proyecto de Vue usa Vite como un servidor de desarrollo inteligente. Este servidor compila tus archivos `.vue` al instante y actualiza el navegador automáticamente cada vez que guardas un cambio (**Hot Module Replacement**), haciendo el desarrollo mucho más rápido y fluido. **No necesitas abrir el `index.html` manualmente.**

---

## Buenas Prácticas

- No subir la carpeta `node_modules` a Git (ya está en `.gitignore`).
- Mantener ambos servidores (backend y frontend) corriendo simultáneamente durante el desarrollo.
- Escribir código modular y reutilizable creando componentes de Vue en la carpeta `src/components/`.
