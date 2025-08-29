# Nombre del Proyecto 
Este proyecto permite interactuar con mapas, calcular rutas y mostrar información geográfica utilizando Leaflet.js y la API de OpenRouteService. Incluye un backend en Node.js + Express y un frontend en HTML, CSS y JavaScript.

---

## Configuración del entorno

Sigue estos pasos para levantar el backend y poder usar el frontend correctamente:

1. Abrir terminal en la carpeta backend
   cd backend

2. Instalar dependencias
   npm install

3. Levantar el servidor

   Opción 1:
   node server.js

   Opción 2 (si tienes definido un script start en package.json):
   npm start

4. Verifica que el servidor esté corriendo  
   Deberías ver el mensaje:  
   Servidor corriendo en http://localhost:3000

5. Levantar el frontend  
   Abre index.html en tu navegador o usa Live Server en VSCode.  
   Asegúrate de levantar el backend antes del frontend para evitar errores de conexión.

---

## Buenas prácticas

- No subir la carpeta node_modules.  
- Mantener el backend corriendo mientras se utiliza el frontend.

---

## Tecnologías usadas

- Node.js + Express  
- JavaScript  
- Leaflet.js (mapas interactivos)  
- OpenRouteService API  
- HTML5 / CSS3

---

## Uso

1. Configura tu archivo .env con tu API Key de OpenRouteService:  
   API_KEY=tu_api_key_aquí
2. Levanta el backend (ver sección Configuración del entorno).  
3. Abre index.html en tu navegador para interactuar con la aplicación.  

---
