# Simulador de Ensamblaje en 3D

Proyecto universitario de la Universidad Nacional de Cañete.

## 🤖 Sky, la asistente del simulador

Sky es el robot de la UNDC que explica cada paso con voz (en vez del cuadro de información).

- Se carga con `js/sky.js` (desde `js/inicio.js`). No modifica tu lógica: escucha los cambios del texto de cada paso.
- Voz: grabaciones originales de Sky (bienvenida y final, en `audio/sky/`) y la voz en español del navegador para el resto de pasos.
- Para usar tu propia voz en otros pasos: mira `audio/sky/GUION.txt` y la tabla `AUDIOS` al inicio de `js/sky.js`.
- Botones de Sky: ▶/■ escuchar o detener · 🔊 voz · Aa texto siempre visible · 📋 ficha técnica completa.

## 🚀 Publicar en Netlify

Arrastra esta carpeta completa (con `index.html` en la raíz) a https://app.netlify.com/drop. No necesita compilar nada.
